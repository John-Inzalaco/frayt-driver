type ErrorRequestData = {
  message: string;
};

type ErrorRequest = {
  data: ErrorRequestData;
  status: number;
};

export class RequestError extends Error {
  response: ErrorRequest;

  constructor(status: number, message: string) {
    super(message);

    this.response = {
      status: status,
      data: { message },
    };
  }
}
