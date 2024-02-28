import React from "react";
import { Modal, ModalProps } from "src/@aragon/ods-old";
import BottomSheet, { BottomSheetProps } from "../BottomSheet";
import useScreen from "src/hooks/useScreen";

type ModalBottomSheetSwitcherProps = ModalProps &
  Omit<BottomSheetProps, "isOpen">;

const ModalBottomSheetSwitcher: React.FC<ModalBottomSheetSwitcherProps> = ({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  closeOnDrag,
  onOpenAutoFocus,
}) => {
  const { isDesktop } = useScreen();

  return (
    <>
      {isDesktop ? (
        <Modal
          isOpen={isOpen}
          onClose={() => onClose?.()}
          title={title}
          subtitle={subtitle}
          onOpenAutoFocus={onOpenAutoFocus}
        >
          {children}
        </Modal>
      ) : (
        <BottomSheet
          isOpen={isOpen ?? false}
          onClose={onClose}
          title={title}
          subtitle={subtitle}
          closeOnDrag={closeOnDrag}
        >
          {children}
        </BottomSheet>
      )}
    </>
  );
};

export default ModalBottomSheetSwitcher;
