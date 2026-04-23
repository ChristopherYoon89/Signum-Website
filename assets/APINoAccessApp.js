import React from 'react';
import {
	Button,
  } from 'antd';
import {
  ApiOutlined,
} from '@ant-design/icons';


const APINoAccessApp = () => {
  
  const onRequestAPI = () => {
    window.location.href = window.DJANGO_URLS.contact
  };


	return (
		<>      
      <div className="api-icon-container">
        <p>
        <ApiOutlined 
          style={{
            fontSize: '32',
            color: '#272727',
          }}
        />
        </p>
        <p>
        <span className='bold'>No API access yet.</span>
        </p>
        
        <div className='api-info-container'>
        Since Signum News is in its early stages, we only offer contact sales 
        API access, which allows us to carefully scale our hardware infrastructure. 
        </div>  

        <div className='api-info-container'>
        If you are interested in an API access, contact us by clicking 
        the button below. Please specify your requirements.
        </div>

        <p style={{ marginTop: 36, }}>
        <Button
          type="primary"
          onClick={() => onRequestAPI()}
        >
        Request API Access
        </Button>
        </p>
      </div>
		</>
	);
};
export default APINoAccessApp;


