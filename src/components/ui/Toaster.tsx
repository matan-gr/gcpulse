import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #E2E8F0',
        },
        className: 'my-toast',
      }}
    />
  );
};
