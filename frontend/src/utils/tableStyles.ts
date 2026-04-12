export const tableRowStyles = {
  '& .deleteButton': {
    visibility: 'hidden',
  },
  '&:hover .deleteButton': {
    visibility: 'visible',
  },
  '@media (hover: none)': {
    '& .deleteButton': {
      visibility: 'visible',
    },
  },
};
