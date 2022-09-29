import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  const TOYO_ID = 19297;

  if (method === 'GET') {
    try {
      const key = await getStaticProps();

      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${TOYO_ID}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CMC_PRO_API_KEY': key,
          },
          method: 'GET',
        },
      );

      const respJSON = await response.json();
      return res.status(200).json({ data: respJSON });
    } catch (error) {
      console.log(error);
      return res.status(422).json({ message: 'Something went wrong' });
    }
  }

  return res.status(404).send('Not found');
}

export async function getStaticProps() {
  const proKey = process.env.COINMARKETCAP_SECRET_KEY;

  return proKey || '';
}
