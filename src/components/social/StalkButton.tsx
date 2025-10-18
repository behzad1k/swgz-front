import { UserPlus, UserMinus } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
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
      icon={isStalkeding ? <img src={UserMinus} alt={getAltFromPath(UserMinus)} width={18} /> : <img src={UserPlus} alt={getAltFromPath(UserPlus)} width={18} />}
    >
      {isStalkeding ? 'Unstalk' : 'Stalk'}
    </Button>
  );
};

export default StalkButton;