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

export interface Bot {
  toAsk(
    customerPhone: string,
    query: string,
    toRespond: (
      messageContent: { title: string; subTitle?: string },
      buttons?: BotButtonOption[],
      list?: BotListOption[]
    ) => void
  ): void;
  setOnSpeakEvent: (event: (customerPhone: string, messageContent: string, data: unknown) => void) => void;
}
