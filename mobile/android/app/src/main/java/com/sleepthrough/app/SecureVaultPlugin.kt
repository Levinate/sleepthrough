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
    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val existing = store.getKey("sleepthrough-vault-v1", null)
        if (existing != null) return existing as SecretKey
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(KeyGenParameterSpec.Builder("sleepthrough-vault-v1", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
        }.generateKey()
    }
    @Synchronized @PluginMethod
    fun get(call: PluginCall) {
        try {
            val name = call.getString("key") ?: throw IllegalArgumentException()
            val value = context.getSharedPreferences("sleepthrough-encrypted", 0).getString(name, null)
            if (value == null) { call.resolve(JSObject().put("value", org.json.JSONObject.NULL)); return }
            val parts = value.split(":")
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)))
            call.resolve(JSObject().put("value", String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), Charsets.UTF_8)))
        } catch (e: Exception) { call.reject("Secure storage could not be opened", "storage_error") }
    }
    @Synchronized @PluginMethod
    fun set(call: PluginCall) {
        try {
            val name = call.getString("key") ?: throw IllegalArgumentException()
            val value = call.getString("value") ?: throw IllegalArgumentException()
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, key())
            val encrypted = Base64.encodeToString(cipher.iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(cipher.doFinal(value.toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)
            if (!context.getSharedPreferences("sleepthrough-encrypted", 0).edit().putString(name, encrypted).commit()) throw IllegalStateException()
            call.resolve()
        } catch (e: Exception) { call.reject("Changes were not saved securely", "storage_error") }
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
