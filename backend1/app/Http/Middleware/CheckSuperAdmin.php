<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized. Please login first.'
            ], 401);
        }
        
        if (!$user->isSuperAdmin()) {
            return response()->json([
                'error' => 'Forbidden. Super admin access only.'
            ], 403);
        }

        return $next($request);
    }
}