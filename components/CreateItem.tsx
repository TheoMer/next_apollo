import React, { memo, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { useUser, CURRENT_USER_QUERY } from './User';
import IpBrowserDetails from './IpBrowserDetails';

interface createItemData {
  id: string;
}

interface createItemVariables {
  title: string;
  description: string;
  mainDescription: string;
  image: string;
  largeImage: string;
  price: number;
  quantity: number;
  userIdentity: string;
  Color: {
    connect: { name: string }
  };
  Size: {
    connect: { name: string }
  };
}

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $mainDescription: String!
    $price: Int!
    $image: String
    $largeImage: String
    $quantity: Int!
    $size: SizeCreateOneInput!
    $color: ColorCreateOneInput!
    $userIdentity: String!
  ) {
    createItem(
      title: $title
      description: $description
      mainDescription: $mainDescription
      price: $price
      image: $image
      largeImage: $largeImage
      quantity: $quantity
      Size: $size
      Color: $color
      userIdentity: $userIdentity
    ) {
      id
    }
  }
`;

interface ColorData {
  colors: any;
}

interface SizeData {
  sizes: any;
}

const GET_COLORS_QUERY = gql`
  query GET_COLORS_QUERY {
    colors {
      id
      name
      label
    }
  }
`;

const GET_SIZES_QUERY = gql`
  query GET_SIZES_QUERY {
    sizes {
      id
      name
      label
    }
  }
`;

//CreateItem
const CreateItem = ({ user_ip, user_Agent, url }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainDescription, setMainDescription] = useState('');
  const [image, setImage] = useState('');
  const [largeImage, setLargeImage] = useState('');
  const [price, setPrice] = useState();
  const [quantity, setQuantity] = useState();
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const uploadFile = async e => {
    setIsLoadingImage(true);
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'flamingo');

    const res = await fetch('https://api.cloudinary.com/v1_1/theomer/image/upload', {
      method: 'POST',
      body: data,
    });
    const file = await res.json();
    //setImage(file.secure_url);
    //setLargeImage(file.eager[0].secure_url);

    const imgSplitSmallImg = file.secure_url.split("upload");
    const newSmallImgUrl = imgSplitSmallImg[0] + 'upload/d_flamingo:default.jpg' + imgSplitSmallImg[1];

    const imgSplitLargeImg = file.eager[0].secure_url.split("upload");
    const newLargeImgUrl = imgSplitLargeImg[0] + 'upload/d_flamingo:default.jpg' + imgSplitLargeImg[1];

    setImage(newSmallImgUrl);
    setLargeImage(newLargeImgUrl);
    setIsLoadingImage(false);
  };

  // User hook
  const user = useUser();
  if (!user) return null;
  if (user.error) return <Error error={user.error} page="" />;

  const me = user.data.me;

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  // Create Item Mutation
  const [createItem, { loading: createItemLoading, error: createItemError }] = useMutation<
    {createItem: createItemData, __typename: string},
    createItemVariables>(CREATE_ITEM_MUTATION, {
    variables: {
      title,
      description,
      mainDescription,
      image,
      largeImage,
      price: parseInt(price),
      quantity: parseInt(quantity),
      userIdentity: 'no-button',
      Color: {
        connect: { name: color }
      },
      Size: {
        connect: { name: size }
      }
    },
    refetchQueries: [{ query: CURRENT_USER_QUERY, variables: {} }]
  });

  // GET COLORS QUERY
  const { data: dataColors, error: errorColors, loading: loadingColors } = useQuery<ColorData, {}>(GET_COLORS_QUERY);

  // GET SIZES QUERY
  const { data: dataSizes, error: errorSizes, loading: loadingSizes } = useQuery<SizeData, {}>(GET_SIZES_QUERY);

  // GET COLORS QUERY Variables
  const colors = dataColors.colors;
  if (!dataColors || (loadingColors && !colors)) return <p>Loading...</p>;
  if (errorColors) return <p>Error: {errorColors.message}</p>;

  // GET SIZES QUERY Variables
  const sizes = dataSizes.sizes;
  if (!dataSizes || (loadingSizes && !sizes)) return <p>CreateItem...</p>;
  if (errorSizes) return <p>Error: {errorSizes.message}</p>;

  return (
    <>
    <Head>
      <title>Flamingo | Women's Swimwear | Ethically Made In The UK - Sell</title>
      <meta name="robots" content="noindex,nofollow" />
    </Head>
    <IpBrowserDetails userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} />
    <Form
      data-test="form"
      onSubmit={async e => {

        e.preventDefault();
        try {

          // call the mutation
          const res = await createItem();
            // Change them to the single item page
          router.push({
            pathname: '/item',
            query: { id: res.data.createItem.id }
          });

        } catch (err) {

          return err;

        }
      }}
    >
      <Error error={createItemError} page="" />
      <fieldset disabled={createItemLoading} aria-busy={createItemLoading || isLoadingImage}>
        <label htmlFor="file">
          Image
          <input
            type="file"
            id="file"
            name="file"
            placeholder="Upload an image"
            required
            onChange={uploadFile}
          />
          {image && (
            <img width="200" src={image} alt="Upload Preview" />
          )}
        </label>
        <label htmlFor="title">
          Title
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label htmlFor="price">
          Price
          <input
            type="number"
            id="price"
            name="price"
            placeholder="Price"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value as any)}
            min="1"
          />
        </label>
        <label htmlFor="description">
          Description
          <textarea
            id="description"
            name="description"
            placeholder="Enter A Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label htmlFor="mainDescription">
          Main Description
          <textarea
            id="mainDescription"
            name="mainDescription"
            placeholder="Enter A Main Description"
            required
            value={mainDescription}
            onChange={(e) => setMainDescription(e.target.value)}
          />
        </label>
        <label htmlFor="quantity">
          Quantity
          <input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="quantity"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value as any)}
            min="1"
          />
        </label>

        {colors && (            
            <label htmlFor="color">
              Colour
              <select
                //type="string"
                id="color"
                name="color"
                placeholder="Select a Color"
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                required
              >
                <option value="">Select a Color</option>
                {colors.map(opt => {
                  return (
                    <option
                      key={opt.name}
                      value={opt.name}>{opt.label}</option>
                  );
                })}
              </select>
            </label>
          )
        }

        {sizes && (
            <label htmlFor="size">
              Size
              <select
                //type="string"
                id="size"
                name="size"
                placeholder="Select a Size"
                value={size} 
                onChange={(e) => setSize(e.target.value)}
                required
              >
                <option value="">Select a Size</option>
                {sizes.map(opt => {
                  return (
                    <option
                      key={opt.name}
                      value={opt.name}>{opt.label}</option>
                  );
                })}
              </select>
            </label>
          )
        }
   
        <button disabled={isLoadingImage ? true : false} type="submit">Submit</button>
      </fieldset>
    </Form>
    </>
  );
}

export default memo(CreateItem);
export { CREATE_ITEM_MUTATION, GET_COLORS_QUERY, GET_SIZES_QUERY };
