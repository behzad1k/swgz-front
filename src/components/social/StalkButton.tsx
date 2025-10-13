import { UserPlus, UserMinus } from 'lucide-react';
import { FC } from 'react';
import Button from '../common/Button';

interface StalkButtonProps {
  isStalkeding: boolean;
  onToggle: () => void;
  loading?: boolean;
}

const StalkButton: FC<StalkButtonProps> = ({ isStalkeding, onToggle, loading = false }) => {
  return (
    <Button
      variant={isStalkeding ? 'secondary' : 'primary'}
      onClick={onToggle}
      disabled={loading}
      icon={isStalkeding ? <UserMinus size={18} /> : <UserPlus size={18} />}
    >
      {isStalkeding ? 'Unstalk' : 'Stalk'}
    </Button>
  );
};

export default StalkButton;