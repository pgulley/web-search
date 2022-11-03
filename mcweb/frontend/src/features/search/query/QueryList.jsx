import * as React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { setQueryList, setNegatedQueryList } from './querySlice';

export default function QueryList(props) {
  const dispatch = useDispatch();

  const [serviceList, setServiceList] = useState([[], [], []]);

  const { negated } = props;

  const { anyAll } = useSelector((state) => state.query);

  // add query
  const handleServiceAdd = () => {
    setServiceList([...serviceList, []]);
  };

  // remove query
  //   const handleServiceRemove = (index) => {
  //     const list = [...serviceList];
  //     // console.log("IN HANDLE SERVICE REMOVE", list, serviceList);
  //     list.splice(index, 1);
  //     setServiceList(list);
  //   };

  // handle changes to query
  const handleQueryChange = (e, index) => {
    const { value } = e.target;
    const list = [...serviceList];
    list[index] = value;
    setServiceList(list);
    if (negated) {
      dispatch(setNegatedQueryList(list));
    } else {
      dispatch(setQueryList(list));
    }
  };

  if (negated) {
    return (
      <div className="query-term-list">
        {serviceList.map((singleService, index) => (
          <div key={index} className="query-term-item">

            <div className="first-division">

              <input
                size="35"
                name="service"
                type="text"
                id="service"
                required
                value={String(singleService)}
                onChange={(e) => handleQueryChange(e, index)}
              />

              {!(serviceList.length - 1 === index) && (
              <span className="and-or">AND NOT</span>
              )}

              {serviceList.length - 1 === index && (
              <div onClick={handleServiceAdd}>
                <AddCircleOutlineIcon sx={{ color: '#d24527', marginLeft: '.5rem' }} />
              </div>
              )}
            </div>
          </div>
        ))}
      </div>

    );
  }

  if (anyAll === 'any') {
    return (
      <div className="query-term-list">
        {serviceList.map((singleService, index) => (
          <div key={index} className="query-term-item">

            <div className="first-division">
              <input
                size="35"
                name="service"
                type="text"
                id="service"
                required
                value={String(singleService)}
                onChange={(e) => handleQueryChange(e, index)}
              />

              {!(serviceList.length - 1 === index) && (
              <span className="and-or">OR</span>
              )}

              {serviceList.length - 1 === index && (
              <div onClick={handleServiceAdd}>
                <AddCircleOutlineIcon sx={{ color: '#d24527', marginLeft: '.5rem' }} />
              </div>
              )}
            </div>
          </div>
        ))}
      </div>

    );
  } if (anyAll === 'all') {
    return (
      <div className="query-term-list">
        {serviceList.map((singleService, index) => (
          <div key={index} className="query-term-item">

            <div className="first-division">
              <input
                size="40"
                name="service"
                type="text"
                id="service"
                required
                value={String(singleService)}
                onChange={(e) => handleQueryChange(e, index)}
              />

              {!(serviceList.length - 1 === index) && (
              <span className="and-or">AND</span>
              )}

              {serviceList.length - 1 === index && (
              <div onClick={handleServiceAdd}>
                <AddCircleOutlineIcon sx={{ color: '#d24527', marginLeft: '.5rem' }} />
              </div>
              )}
            </div>
          </div>
        ))}
      </div>

    );
  }
}