package com.nuclearplayer

import android.app.Activity
import android.os.Handler
import android.os.Looper
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import kotlin.concurrent.thread

@InvokeArg
class RunArgs {
    var args: List<String> = emptyList()
}

// Bridge: desktop yt-dlp CLI argv → embedded CPython (Chaquopy).
// Kracht perf fix (v0.2.2): run() executes on a background thread so the
// Android main/UI thread never blocks on Python cold-start (3-6s) or
// network extraction (2-5s). Prevents ANR-style input delays and the
// "app almost crashes" jank the main-thread version caused.
@TauriPlugin
class YtdlpPlugin(private val activity: Activity) : Plugin(activity) {
    private val mainHandler = Handler(Looper.getMainLooper())

    private fun ensurePythonStarted() {
        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(activity.applicationContext))
        }
    }

    @Command
    fun run(invoke: Invoke) {
        // Warm up Python off the main thread as early as possible:
        // the first yt-dlp call is where Chaquopy costs its cold-start.
        thread(name = "ytdlp-warmup") { runCatching { ensurePythonStarted() } }

        // Parse args on the caller thread (cheap), then execute yt-dlp
        // on a worker thread and resolve on the main thread (Tauri
        // requires JS-bridge resolution on main).
        val args = try {
            invoke.parseArgs(RunArgs::class.java)
        } catch (error: Exception) {
            invoke.reject(error.message ?: "yt-dlp args failed")
            return
        }

        thread(name = "ytdlp-run") {
            try {
                ensurePythonStarted()
                val module = Python.getInstance().getModule("nuclear_ytdlp")
                val stdout = module.callAttr("run", args.args.toTypedArray()).toString()
                val result = JSObject()
                result.put("stdout", stdout)
                mainHandler.post { invoke.resolve(result) }
            } catch (error: Exception) {
                val message = error.message ?: "yt-dlp execution failed"
                mainHandler.post { invoke.reject(message) }
            }
        }
    }
}
