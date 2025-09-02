import { LastSession } from '../../dataTypes';
import LastSessionPlaceholder from './LastSessionPlaceHolder';
import LastSessionBody from './LastSessionBody';

const LastSessionCard = ({ session }: { session: LastSession | null }) => {
  return session? (
    <LastSessionBody session={session} />
  ) : (
    <LastSessionPlaceholder />
  );
};

export default LastSessionCard;