const handler = async () => {
  return {
    statusCode: 302,
    headers: {
      'Location': process.env.SIGN_IN_URL,
    },
  }
}

export { handler };
