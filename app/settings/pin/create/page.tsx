import SetPinForm from '@/components/ui/SetPinForm';

export default function CreatePinPage() {
  return (
    <SetPinForm
      successPath="/profile-select"
      showBack={true}
      backPath="/profile-select"
    />
  );
}