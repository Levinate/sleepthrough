package com.sleepthrough.app

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

@CapacitorPlugin(name = "SecureVault")
class SecureVaultPlugin : Plugin() {
    private inline fun <T> at(step: String, operation: () -> T): T = try { operation() } catch(e: Exception) { throw VaultStep(step,e) }
    private fun preferences() = context.applicationContext.getSharedPreferences("sleepthrough-encrypted", 0)
    private fun key(create: Boolean): SecretKey {
        val store = at("key_load") { KeyStore.getInstance("AndroidKeyStore").apply { load(null) } }
        val existing = at("key_get") { store.getKey("sleepthrough-vault-v1", null) }
        if (existing != null) return existing as SecretKey
        // Never replace a missing key when ciphertext still depends on it.
        if (!create || preferences().all.isNotEmpty()) throw VaultMissingKey()
        return at("key_create") { KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(KeyGenParameterSpec.Builder("sleepthrough-vault-v1", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
        }.generateKey() }
    }
    private fun reject(call: PluginCall, error: Exception, fallback: String) {
        val report = VaultFailure.describe(error,fallback)
        call.reject(if(fallback == "vault_read") "Secure storage could not be opened" else "Changes were not saved securely", report.getString("code"), report)
    }
    @Synchronized @PluginMethod
    fun get(call: PluginCall) {
        try {
            val name = call.getString("key") ?: throw IllegalArgumentException()
            val value = at("prefs_read") { preferences().getString(name, null) }
            if (value == null) { call.resolve(JSObject().put("value", org.json.JSONObject.NULL)); return }
            val parts = value.split(":")
            if (parts.size != 2) throw VaultInvalidFormat()
            val iv: ByteArray; val ciphertext: ByteArray
            try { iv = Base64.decode(parts[0], Base64.NO_WRAP); ciphertext = Base64.decode(parts[1], Base64.NO_WRAP) }
            catch(e: IllegalArgumentException) { throw VaultInvalidFormat() }
            if (iv.size != 12 || ciphertext.size < 16) throw VaultInvalidFormat()
            val secret = key(false)
            val cipher = at("cipher_create") { Cipher.getInstance("AES/GCM/NoPadding") }
            at("cipher_init") { cipher.init(Cipher.DECRYPT_MODE, secret, GCMParameterSpec(128, iv)) }
            val plaintext = at("cipher_finish") { cipher.doFinal(ciphertext) }
            call.resolve(JSObject().put("value", String(plaintext, Charsets.UTF_8)))
        } catch (e: Exception) { reject(call,e,"vault_read") }
    }
    @Synchronized @PluginMethod
    fun set(call: PluginCall) {
        try {
            val name = call.getString("key") ?: throw IllegalArgumentException()
            val value = call.getString("value") ?: throw IllegalArgumentException()
            val secret = key(true)
            val cipher = at("cipher_create") { Cipher.getInstance("AES/GCM/NoPadding") }
            at("cipher_init") { cipher.init(Cipher.ENCRYPT_MODE, secret) }
            val plaintext = value.toByteArray(Charsets.UTF_8)
            val ciphertext = at("cipher_finish") { cipher.doFinal(plaintext) }
            // Obtain the final nonce after encryption and verify that the same key can read it.
            val iv = cipher.iv
            if (iv == null || iv.size != 12) throw VaultVerificationFailed()
            at("write_verify") {
                val verify = Cipher.getInstance("AES/GCM/NoPadding")
                verify.init(Cipher.DECRYPT_MODE, key(false), GCMParameterSpec(128, iv))
                if (!java.security.MessageDigest.isEqual(plaintext,verify.doFinal(ciphertext))) throw VaultVerificationFailed()
            }
            val encrypted = Base64.encodeToString(iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(ciphertext, Base64.NO_WRAP)
            at("prefs_write") { if (!preferences().edit().putString(name, encrypted).commit()) throw IllegalStateException() }
            call.resolve()
        } catch (e: Exception) { reject(call,e,"vault_write") }
    }
    @PluginMethod
    fun remove(call: PluginCall) {
        val name = call.getString("key") ?: return call.reject("Missing key")
        if (context.getSharedPreferences("sleepthrough-encrypted", 0).edit().remove(name).commit()) call.resolve()
        else call.reject("Could not remove local data", "storage_error")
    }
    @PluginMethod
    fun exportFile(call: PluginCall) {
        try {
            val text = call.getString("content") ?: throw IllegalArgumentException()
            val directory = java.io.File(context.cacheDir, "exports").apply { mkdirs() }; val csv = call.getString("format") == "csv"; val file = java.io.File(directory, if(csv) "sleepthrough-nights.csv" else "sleepthrough-export.json")
            file.writeText(text)
            val uri = androidx.core.content.FileProvider.getUriForFile(context, context.packageName + ".fileprovider", file)
            val intent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                type = if(csv) "text/csv" else "application/json"; putExtra(android.content.Intent.EXTRA_STREAM, uri)
                addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            activity.startActivity(android.content.Intent.createChooser(intent, "Export your SleepThrough data"))
            call.resolve()
        } catch (e: Exception) { call.reject("Could not export your data", "export_error") }
    }
}
