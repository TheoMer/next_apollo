import React, { FC, memo, useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { useUser } from './User';
import IpBrowserDetails from './IpBrowserDetails';
import { useClient } from '../lib/Client';

interface Color {
  id: string;
  name: string;
  label: string;
}

interface Size {
  id: string;
  name: string;
  label: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  mainDescription: string;
  price: number;
  quantity: number;
  image: string;
  largeImage: string;
  Color: Color;
  Size: Size;
}

interface AllSingleItemData {
  item: Item;
}

interface AllSingleItemVariables {
  id: string;
}

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: String!) {
    item(where: { id: $id }) {
      id
      title
      description
      mainDescription
      price
      quantity
      image
      largeImage
      Color {
        id
        name
        label
      }
      Size {
        id
        name
        label
      }
    }
  }
`;

interface AllColorData {
  colors: Color[];
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

interface AllSizeData {
  sizes: Size[];
}

const GET_SIZES_QUERY = gql`
  query GET_SIZES_QUERY {
    sizes {
      id
      name
      label
    }
  }
`;

interface updateItemData {
  id: string;
  title: string;
  description: string;
  mainDescription: string;
  price: number;
  quantity: number;
  image: string;
  largeImage: string;
  Color: Color
  Size: Size;

}

interface updateItemVariables {
  title: string;
  description: string;
  mainDescription: string;
  price,
  quantity,
  image: string;
  largeImage: string;
  color: any;
  size: any;
}

//Mutation 
const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: String!, 
    $title: String, 
    $description: String, 
    $mainDescription: String, 
    $price: Int, 
    $quantity: Int, 
    $size: SizeUpdateOneRequiredWithoutItemInput
    $color: ColorUpdateOneRequiredWithoutItemInput
    $image: String, 
    $largeImage: String
    ) {
    updateItem(
      data: {
      id: $id
      title: $title, 
      description: $description, 
      mainDescription: $mainDescription, 
      price: $price, 
      quantity: $quantity,
      Size: $size,
      Color: $color, 
      image: $image, 
      largeImage: $largeImage
      },
      where: { id: $id }
    ) {
      id
      title
      description
      mainDescription
      price
      quantity
      image
      largeImage
      Color {
        id
        name
        label
      }
      Size {
        id
        name
        label
      }          
    }
  }
`;

interface Props {
  id: string;
  user_ip: string; 
  user_Agent: string; 
  url: string;
  /*title: string; // For propTypes check at bottom
  price: number; // For propTypes check at bottom
  description: string; // For propTypes check at bottom
  mainDescription: string; // For propTypes check at bottom
  */
}

// UpdateItem
const UpdateItem: FC<Props> = ({ id, user_ip, user_Agent, url }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainDescription, setMainDescription] = useState('');
  const [image, setImage] = useState('');
  const [largeImage, setLargeImage] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  //const { user_ip, user_Agent, url } = props; // From pages/update.js

  const updateItem2 = async (e, updateItemMutation) => {
    e.preventDefault();
    console.log('Updating Item!!');
    const res = await updateItemMutation({
      variables: {
        id: id,
        title,
        description,
        mainDescription,
        price: price,
        quantity: quantity,
        image: e.target.file.value === '' ? e.target.hiddenImage.value : image,
        largeImage: e.target.file.value === '' ? e.target.hiddenlargeImage.value : largeImage,
        color: {
          connect: { name: color }
        },
        size: {
          connect: { name: size }
        }
      }
    });
    console.log('Updated!!');
  };

  const uploadFile = async e => {
    console.log('updateFile triggered')
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'flamingo');

    const res = await fetch('https://api.cloudinary.com/v1_1/theomer/image/upload', {
      method: 'POST',
      body: data,
    });
    const file = await res.json();
    setImage(file.secure_url);
    setLargeImage(file.eager[0].secure_url);
  };

  // Client
  const client = useClient();

  // User hook
  const user = useUser();

  // Single Item Query
  const { data: singledItemData, error: errorSingleItem, loading: loadingSingleItem } = useQuery<
  AllSingleItemData, 
  AllSingleItemVariables
  >(
    SINGLE_ITEM_QUERY, {
      variables: {
        id: id,
      }
    }
  );

  // UPDATE ITEM MUTATION
  const [updateItem, { error: errorUpdateItem, loading: loadingUpdateItem }] = useMutation<
    {updateItem: updateItemData},
    updateItemVariables>(UPDATE_ITEM_MUTATION, {
    variables: {
      title,
      description,
      mainDescription,
      price,
      quantity,
      image,
      largeImage,
      color,
      size
    }
  });

  // GET COLORS QUERY
  const { data: dataColors, error: errorColors, loading: loadingColors } = useQuery<AllColorData, {}>(GET_COLORS_QUERY);

  // GET SIZES QUERY
  const { data: dataSizes, error: errorSizes, loading: loadingSizes } = useQuery<AllSizeData, {}>(GET_SIZES_QUERY);

  useEffect(() => {
    if (singledItemData.item) {
      // Set default values for each state variable.
      setTitle(singledItemData.item.title);
      setDescription(singledItemData.item.description);
      setMainDescription(singledItemData.item.mainDescription);
      setPrice(singledItemData.item.price);
      setQuantity(singledItemData.item.quantity);
      setColor(singledItemData.item.Color.name);
      setSize(singledItemData.item.Size.name);
    }
  }, [singledItemData]);

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} page="" />;

  const me = user.data.me;

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  // Single Item Query variables

  if (loadingSingleItem) return <p>Loading...</p>;
  if (!singledItemData.item) return <p>No Item Found for ID {id}</p>;

  // GET COLORS QUERY Variables
  const colors = dataColors.colors;
  if (!dataColors || (loadingColors && !colors)) return <p>UpdateItem...</p>;
  if (errorColors) return <p>Error: {errorColors.message}</p>;

  // GET SIZES QUERY Variables
  const sizes = dataSizes.sizes;
  if (!dataSizes || (loadingSizes && !sizes)) return <p>UpdateItem...</p>;
  if (errorSizes) return <p>Error: {errorSizes.message}</p>;

  return (
    <>
    <IpBrowserDetails userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} />
    <Form onSubmit={e => updateItem2(e, updateItem)}>
      <Error error={errorUpdateItem} page="" />
      <fieldset disabled={loadingUpdateItem} aria-busy={loadingUpdateItem}>
        <label htmlFor="file">
          Current Image
          <input
            type="file"
            id="file"
            name="file"
            placeholder="Upload an image"
            onChange={uploadFile}
          />
          {!image && (
            <img width="200" src={singledItemData.item.image} alt="Current Image" />
          )}
          {image && (
            <img width="200" src={image} alt="Upload Preview" />
          )}             
        </label>

        <input
          type="text"
          id="hiddenImage"
          name="hiddenImage"
          defaultValue={singledItemData.item.image}
          hidden
          readOnly
        />
        <input
          type="text"
          id="hiddenlargeImage"
          name="hiddenlargeImage"
          defaultValue={singledItemData.item.largeImage}
          hidden
          readOnly
        />   

        <label htmlFor="title">
          Title
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            required
            defaultValue={singledItemData.item.title}
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
            defaultValue={singledItemData.item.price}
            onChange={(e) => setPrice(e.target.value as any)}
          />
        </label>

        <label htmlFor="description">
          Description
          <textarea
            id="description"
            name="description"
            placeholder="Enter A Description"
            required
            defaultValue={singledItemData.item.description}
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
            defaultValue={singledItemData.item.mainDescription}
            onChange={(e) => setMainDescription(e.target.value)}
          />
        </label>

        <label htmlFor="quantity">
          Quantity
          <input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="Quantity"
            required
            defaultValue={singledItemData.item.quantity}
            onChange={(e) => setQuantity(e.target.value as any)}
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
        
        <button type="submit">Sav{loadingUpdateItem ? 'ing' : 'e'} Changes</button>
      </fieldset>
    </Form>
    </>
  );
}

/*UpdateItem.propTypes = { 
  title: PropTypes.string, 
  price: PropTypes.number, 
  description: PropTypes.string,
  mainDescription: PropTypes.string,
}*/

export default memo(UpdateItem);
export { UPDATE_ITEM_MUTATION };
