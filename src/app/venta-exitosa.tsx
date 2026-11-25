import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SuccessDialog } from '@/components/ui';

/**
 * POPUP NUEVO · Confirmación de venta exitosa.
 * Responsable de contenido visual: Integrante 4 (Operaciones de venta).
 * El contenedor, el scrim y el diálogo son compartidos (SuccessDialog).
 */
export default function VentaExitosaScreen() {
  const router = useRouter();
  const { nombre, cantidad, total } = useLocalSearchParams<{
    nombre?: string;
    cantidad?: string;
    total?: string;
  }>();

  const detalle = [cantidad ? `${cantidad} unidades` : null, total ? `Bs. ${total}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={{ flex: 1 }}>
      <SuccessDialog
        title="Venta registrada"
        message={
          nombre
            ? `Se descontaron ${cantidad ?? 'las'} unidades de ${nombre}. El stock ya está actualizado.`
            : 'La venta se registró y el stock ya está actualizado.'
        }
        detail={detalle || undefined}
        primaryLabel="Volver a vencimientos"
        onPrimary={() => router.dismissAll()}
        secondaryLabel="Ver historial"
        onSecondary={() => {
          router.dismissAll();
          router.push('/historial');
        }}
      />
    </View>
  );
}
