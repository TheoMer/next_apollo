import React, { memo } from 'react';
import MutationOnMount from './MutationOnMount';
import { useClient } from '../lib/Client';

//Update item quantity
const UpdateItemQuantity = props => {

    // Client
    const client = useClient();

    return (
        <MutationOnMount client={client} />
    );
}

export default memo(UpdateItemQuantity);
