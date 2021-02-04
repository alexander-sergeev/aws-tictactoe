const handler = (event: any, context: any, callback: any) => {
  event.response.autoConfirmUser = true;
  callback(null, event);
}

export { handler };
