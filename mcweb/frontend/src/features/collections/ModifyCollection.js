import * as React from 'react';
import { TextField, MenuItem, Box, FormControlLabel, Button, Checkbox } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDeleteCollectionMutation, useUpdateCollectionMutation } from '../../app/services/collectionsApi';

import SourceItem from '../sources/SourceItem';

//rtk api operations
import {
  useGetCollectionAndAssociationsQuery,
  useDeleteSourceCollectionAssociationMutation,
  useCreateSourceCollectionAssociationMutation
} from '../../app/services/sourcesCollectionsApi';

import { useGetSourceQuery } from '../../app/services/sourceApi';

//rtk actions to change state
import {
  setCollectionSourcesAssociations,
  dropSourceCollectionAssociation,
  setSourceCollectionAssociation
} from '../sources_collections/sourcesCollectionsSlice';
import { setCollection } from './collectionsSlice';
import { setSources, setSource } from '../sources/sourceSlice';

export default function ModifyCollection() {
  const params = useParams()
  const collectionId = Number(params.collectionId); //get collection id from wildcard

  //send get query and associations
  const { data } = useGetCollectionAndAssociationsQuery(collectionId);

  // form state for text fields 
  const [formState, setFormState] = useState({
    id: 0, name: "", notes: "",
  });

  //set form data to the collection specified in url
  useEffect(() => {
    if (data) {
      const formData = {
        id: collection.id,
        name: collection.name,
        notes: collection.notes
      }
      setFormState(formData)
    }
  }, [collection])

  //formState declaration
  const handleChange = ({ target: { name, value } }) => setFormState((prev) => ({ ...prev, [name]: value }))

  // menu options
  const services = ["Online News", "Youtube"]


//patch for now, sources in the future will be uploadable only by csv
  const [sourceId, setSourceId] = useState("");
  const sourceData = useGetSourceQuery(sourceId)

  //RTK QUERY OPERATIONS
  //create association
  const [createSourceCollectionAssociation, associationResult] = useCreateSourceCollectionAssociationMutation();

  // update 
  const [updateCollection, { setUpdate }] = useUpdateCollectionMutation();

  // delete 
  const [deleteCollection, { setRemove }] = useDeleteCollectionMutation();

  // delete association
  const [deleteSourceCollectionAssociation, deleteResult] = useDeleteSourceCollectionAssociationMutation();

  if (!collection){
    return (<></>)
  }
  else { return (
    <div className='modify-collection-container'>
      <div className="collection-header">
        <h2 className="title">Modify this Collection</h2>
        <ul>
          {/* Name */}
          <li>
            <h5>Name</h5>
            <TextField
              fullWidth
              id="text"
              name="name"
              value={formState.name}
              onChange={handleChange}
            />
          </li>

          {/* Notes */}
          <li>
            <h5>Notes</h5>
            <TextField
              fullWidth
              id="outlined-multiline-static"
              name="notes"
              multiline
              rows={4}
              value={formState.notes}
              onChange={handleChange}
            />
          </li>

          {/* Update */}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              const updatedCollection = await updateCollection({
                id: formState.id,
                name: formState.name,
                notes: formState.notes
              }).unwrap();
            }}
          >
            Update
          </Button>

          {/* Delete */}
          {/* <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async () => {
              console.log(formState.id)
              const deletedCollection = await deleteCollection({
                id: formState.id
              }).unwrap()
              console.log(deletedCollection)
            }}
          >
            Delete
          </Button> */}


          <label> Add Source to Collection (enter the source ID): 
            <input type="text" value={sourceId} onChange={e => setSourceId(Number(e.target.value)) } />
          </label>

          <button onClick={() => {
            const assoc = {'source_id': sourceId, 'collection_id': collectionId} //get assoc data and package
            const source = sourceData.data; //data from getSource with entered id
            dispatch(setSource({'sources': source})) // put the source in the redux state
            createSourceCollectionAssociation(assoc) //create association
              .then(() => dispatch(setSourceCollectionAssociation(assoc))) //if success update redux store
            setSourceId("") //reset id input field
          }}>Add Source</button>

          <h5>Sources</h5>
          <ul className='modify-collection-source-list'>
            {
              Object.values(sources).map(source => { // sources object {1: {id: 1, name: etc}}
                return(
                  <div key={`source-item-modify-collection-${source.id}`} className="modify-collection-source-item-div">
                    <SourceItem  source={source} />
                    <button onClick={() => {
                      deleteSourceCollectionAssociation({
                        "source_id": source.id,
                        "collection_id": collectionId
                      }) //onClick send rtk mutation
                        .then(results => dispatch(dropSourceCollectionAssociation(results))) //with results update redux store (only doing sourceCollections at this point)
                    }}>Remove</button>
                  </div>
                ) 
              })
            }
          </ul>
        </ul>
      </div>
    </div >
  )};
}