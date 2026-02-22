import * as React from 'react';

export default function useModalState<T>() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<T | undefined>(undefined);

  const handleOpen = (item: T) => {
    setSelected(item);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelected(undefined);
    setOpen(true);
  };

  const handleClose = async () => {
    setOpen(false);
    setSelected(undefined);
  };

  return { open, selected, handleOpen, handleCreate, handleClose };
}
