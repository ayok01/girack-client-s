export type Message = {
    id: string;
    text: string;
    sender: string;
    createdAt: Date;
    avaterImg: string;
};


export type Chat = {
    id: string;
    name: string;
    messages: Message[];
};