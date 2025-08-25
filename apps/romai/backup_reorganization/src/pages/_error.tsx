import React from 'react'
import { NextPageContext } from 'next';

interface ErrorProps {
    statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold">
                    {statusCode ? statusCode : 'Client Error'}
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    {statusCode
                        ? `A ${statusCode} error occurred on server`
                        : 'An error occurred on client'}
                </p>
            </div>
        </div>
    );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;

