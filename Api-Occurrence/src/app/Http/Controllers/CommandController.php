<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Domain\Idempotency\Services\CommandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class CommandController extends Controller
{
    public function __construct(
        private readonly CommandService $commandService,
    ) {
    }

    public function getCommandStatus(string $id): JsonResponse
    {
        $result = $this->commandService->getCommandStatus($id);

        return response()->json($result->toArray());
    }
}

