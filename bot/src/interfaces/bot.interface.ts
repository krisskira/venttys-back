export interface BotButtonOption {
  buttonText: {
    displayText: string;
  };
}

export interface BotListOption {
  title: string;
  rows: {
    title: string;
    description?: string;
  }[];
}

export interface iBot {
  getResponse(
    context: string,
    query: string,
    responder: (
      messageContent: { title: string; subTitle?: string },
      buttons?: BotButtonOption[],
      list?: BotListOption[]
    ) => void
  ): void;
}
