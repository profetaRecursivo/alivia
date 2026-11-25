import { useCallback, useEffect, useRef, useState } from 'react';

type PendingAction = {
  message: string;
  /** Se ejecuta si el usuario NO toca DESHACER. */
  commit: () => void;
  /** Se ejecuta si el usuario toca DESHACER. */
  undo: () => void;
};

/**
 * Snackbar con DESHACER de 5 s (guía ALIVIA, Heurística de arrepentimiento).
 * Uso:
 *   const undo = useUndoSnackbar();
 *   undo.show({ message: 'Venta registrada', commit, undo });
 *   ...
 *   {undo.visible && <UndoSnackbar message={undo.message} onAction={undo.runUndo} />}
 */
export function useUndoSnackbar(timeoutMs = 5000) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const pending = useRef<PendingAction | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const show = useCallback(
    (action: PendingAction) => {
      clear();
      pending.current = action;
      setMessage(action.message);
      setVisible(true);
      timer.current = setTimeout(() => {
        pending.current?.commit();
        pending.current = null;
        setVisible(false);
      }, timeoutMs);
    },
    [clear, timeoutMs]
  );

  const runUndo = useCallback(() => {
    clear();
    pending.current?.undo();
    pending.current = null;
    setVisible(false);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { visible, message, show, runUndo };
}
