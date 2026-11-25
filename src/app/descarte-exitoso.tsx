import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SuccessDialog } from '@/components/ui';

/**
 * POPUP NUEVO · Confirmación de descarte exitoso.
 * Responsable de contenido visual: Integrante 4 (Descartar BottomSheet).
 * El contenedor, el scrim y el diálogo son compartidos (SuccessDialog).
 */
export default function DescarteExitosoScreen() {
  const router = useRouter();
  const { nombre, cantidad, motivo } = useLocalSearchParams<{
    nombre?: string;
    cantidad?: string;
    motivo?: string;
  }>();

  const detalle = [cantidad ? `${cantidad} unidades` : null, motivo]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={{ flex: 1 }}>
      <SuccessDialog
        title="Descarte registrado"
        message={
          nombre
            ? `${nombre} se retiró del estante y quedó registrado en el historial de bajas.`
            : 'El lote se retiró del estante y quedó registrado en el historial de bajas.'
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
