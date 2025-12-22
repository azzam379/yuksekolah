<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class SystemController extends Controller
{
    private $settingsFile = 'settings.json';

    /**
     * Get all system settings
     */
    public function index(Request $request)
    {
        // Public read? Or Admin only?
        // Usually, 'maintenance_mode' needs to be checked publicly, but the actual list of settings is admin only.
        // For this API, let's assume it's for the Admin Dashboard to VIEW state.

        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($this->getSettings());
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'maintenance_mode' => 'boolean',
            'allow_registration' => 'boolean',
        ]);

        $current = $this->getSettings();
        $newSettings = array_merge($current, $validated);

        Storage::put($this->settingsFile, json_encode($newSettings));

        return response()->json([
            'message' => 'Settings updated',
            'settings' => $newSettings
        ]);
    }

    /**
     * Helper to get settings with defaults
     */
    private function getSettings()
    {
        if (!Storage::exists($this->settingsFile)) {
            // Defaults
            return [
                'maintenance_mode' => false,
                'allow_registration' => true,
            ];
        }

        return json_decode(Storage::get($this->settingsFile), true);
    }
}
