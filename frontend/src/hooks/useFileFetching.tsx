import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LOGGER } from '../LOGGER';

export const useFileFetching = () => {
    const params = useParams();
    const directoryId = params.id;

    const [fetching, setFetching] = useState(true);
    const [data, setData] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            setError(null);
            // setData([]);
            let url = '/api/dir';

            if (directoryId) url += `/${directoryId}`;

            // console.log(url)
            try {
                const resData = await axios.get(url).then((res) => res.data);

                LOGGER.debug(resData);

                setData(resData);
                setFetching(false);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setError('Invalid directory');
                } else {
                    setError('There was an error');
                }

                // TODO: Make proper error messages
                setFetching(false);
                setData([]);
                console.log(err);
            }
        };

        fetchData();
    }, [directoryId]);

    return { fetching, error, directoryId, data };
};
