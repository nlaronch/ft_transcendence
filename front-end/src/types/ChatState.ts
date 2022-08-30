import type User from '@/types/User';
import type Channel from '@/types/Channel';
import type Discussion from '@/types/Discussion';
import type Message from '@/types/Message';
import type PartToDisplay from '@/types/ChatPartToDisplay';

export interface ChatState {
	users: User[];
	friends: User[];
	channels: Channel[];
	userDiscussions: Discussion[];
	inDiscussion: Discussion | null;
	userChannels: Channel[];
	inChannel: Channel | null;
	inChannelRegistration: boolean;
	cardRightPartToDisplay: PartToDisplay;
	cardLeftPartToDisplay: PartToDisplay;
	cardRightTitle: string;
	messages: Message[];
	selectedItems: User[] | Channel[];
}

export default ChatState;
