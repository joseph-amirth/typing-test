import { useEffect, useState } from "react";
import { KeyboardService, Mode, Bind, BindOrMode, Hint } from ".";

export function KeyboardServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bindsAndModes, setBindsAndModes] = useState<BindOrMode[]>([]);
  const [currentMode, setCurrentMode] = useState<Mode | undefined>(undefined);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (currentMode !== undefined) {
        for (const bind of currentMode.binds) {
          if (key === bind.key) {
            bind.callback();
            break;
          }
        }
        return;
      }
      for (const bindOrMode of bindsAndModes) {
        if (key === bindOrMode.key) {
          if ("binds" in bindOrMode) {
            setCurrentMode(bindOrMode);
          } else {
            bindOrMode.callback();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [bindsAndModes, currentMode]);

  function bind(bind: Bind) {
    setBindsAndModes((bindsAndModes) => {
      return [...bindsAndModes, bind];
    });
  }

  function unbind(bind: Bind) {
    setBindsAndModes((bindsAndMode) => {
      return bindsAndMode.filter((bindOrMode) => bindOrMode !== bind);
    });
  }

  function bindMode(mode: Mode) {
    setBindsAndModes((bindsAndModes) => {
      return [...bindsAndModes, mode];
    });
  }

  function unbindMode(mode: Mode) {
    setBindsAndModes((bindsAndModes) => {
      return bindsAndModes.filter((bindOrMode) => bindOrMode !== mode);
    });
  }

  let hints: Hint[];
  if (currentMode !== undefined) {
    hints = currentMode.binds;
  } else {
    hints = bindsAndModes;
  }

  const keyboardService = {
    bind,
    unbind,
    bindMode,
    unbindMode,
    hints,
  };

  return (
    <KeyboardService.Provider value={keyboardService}>
      {children}
    </KeyboardService.Provider>
  );
}
