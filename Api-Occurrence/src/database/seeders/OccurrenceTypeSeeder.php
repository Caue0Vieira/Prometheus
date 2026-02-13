<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

class OccurrenceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'incendio_urbano',
                'name' => 'Incêndio Urbano',
                'active' => true,
            ],
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'resgate_veicular',
                'name' => 'Resgate Veicular',
                'active' => true,
            ],
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'atendimento_pre_hospitalar',
                'name' => 'Atendimento Pré-Hospitalar',
                'active' => true,
            ],
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'salvamento_aquatico',
                'name' => 'Salvamento Aquático',
                'active' => true,
            ],
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'falso_chamado',
                'name' => 'Falso Chamado',
                'active' => true,
            ],
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'vazamento_gas',
                'name' => 'Vazamento de Gás',
                'active' => true,
            ],
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'queda_arvore',
                'name' => 'Queda de Árvore',
                'active' => true,
            ],
            [
                'id' => Uuid::uuid7()->toString(),
                'code' => 'incendio_florestal',
                'name' => 'Incêndio Florestal',
                'active' => true,
            ],
        ];

        foreach ($types as $type) {
            DB::table('occurrence_types')->insert([
                'id' => $type['id'],
                'code' => $type['code'],
                'name' => $type['name'],
                'active' => $type['active'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
