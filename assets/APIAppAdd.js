import React, { useState, useEffect } from 'react';
import {
	Row,
	Col,
	Card,
	Button,
	Input,
	Checkbox,
  Layout,
  Tooltip,
  Divider,
  Alert,
  InputNumber,
  } from 'antd';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from "./AuthProvider.js";
import APINoAccessApp from './APINoAccessApp.js';
import { getCookie } from './ManagerUtility.js';


var csrftoken = getCookie('csrftoken');


const CompClientUsername = ({ clientusername }) => {
  return (
    <>
      <div className="sig-form-header">
        Username
      </div>
      <div className='sig-form-input'>
        {clientusername}
      </div>
    </>
  );
};


const CompClientTokenLimit = ({ clienttokenlimit }) => {
  return (
    <>
      <div className="sig-form-header">
        Monthly token limit
        <span>
          <Tooltip
            placement='right'
            title='Maximum token usage permitted under your contract'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
      {clienttokenlimit}
      </div>
    </>
  );
};


const CompClientTotalUsedTokens = ({ clienttotalusedtokens }) => {
  return (
    <>
      <div className="sig-form-header">
        Total token usage
        <span>
          <Tooltip
            placement='right'
            title='Number of tokens already used'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        {clienttotalusedtokens}
      </div>
    </>
  );
};


const CompInputName = ({ apikeyname, onChangeKeyName }) => {
  return(
    <>
      <div className="sig-form-header">
        Name of key
        <span>
          <Tooltip
            placement='right'
            title='Define a name to identify your API key'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        <Input 
          placeholder="Enter name of API key"
          onChange={(e) => onChangeKeyName(e.target.value)}
          style={{	width: 400,	}}	
          value={apikeyname}
        />
      </div>
    </>
  );
};


const CompKeyTokenLimit = ({ apikeytokenlimit, onChangeKeyTokenLimit }) => {
  return(
    <>
      <div className="sig-form-header">
        Key's token limit
        <span>
          <Tooltip
            placement='right'
            title='Specify a limit for this key'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        <InputNumber
          min={0}
          value={apikeytokenlimit}
          onChange={onChangeKeyTokenLimit}
          style={{ width: 400, }}
        />
      </div>
    </>
  );
};



const CompKeyActive = ({ apikeyisactive, onChangeKeyActive }) => {
  return(
    <>
      <div className="sig-form-header">
        Active
        <span>
          <Tooltip
            placement='right'
            title='Activate or deactivate the key. If deactivated, requests using this key will be blocked'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        <Checkbox
          onChange={(e) => onChangeKeyActive(e.target.value)}	
          checked={apikeyisactive}
        />
      </div>
    </>
  );
};



const CompKeyDateCreated = () => {
  return (
    <>
      <div className="sig-form-header">
        Date created
        <span>
          <Tooltip
            placement='right'
            title='Original creation date of the API key'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        Today
      </div>
    </>
  );
};



const CompKey = ({ keygenerated }) => {
  return (
    <>
      <div className="sig-form-header">
        Key
        <span>
          <Tooltip
            placement='right'
            title='Copy this key for use in your requests and store it securely'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        <div className="api-generated-key">{keygenerated}</div>
      <div className="api-key-description">
      <p>Click on the button 'Generate new key and save' and store the newly generated key securely.</p>
      </div>
      </div>
    </>
  );
};


const APIAppAdd = () => {
  const { isauthenticated, user } = useAuth();
  const [clienttokenlimit, setClientTokenLimit] = useState(0);
  const [clienttotalusedtokens, setClientTotalUsedTokens] = useState(0);
  const [apikeyname, setAPIKeyName] = useState('');
  const [apikeytokenlimit, setAPIKeyTokenLimit] = useState(0);

  const [apikeyisactive, setAPIKeyIsActive] = useState(true);
  const [keygenerated, setKey] = useState('-');
  
  const [showalert, setShowAlert] = useState(false);
  const [alertmessage, setAlertMessage] = useState('');
  const [alerttype, setAlertType] = useState('');


  useEffect(() => {
    const fetchAPIClient = async () => {
      const response = await axios.get(`/api/APIClientUser`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      })
      const clientdata = response.data[0]
      setClientTokenLimit(Number(clientdata.monthly_token_limit) || 0);
      setClientTotalUsedTokens(clientdata.total_token_usage || 0);
      };
      fetchAPIClient();
  }, [])


  const onShowAlert = (message, type, show) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(show);
  };


  const onSaveKey = async () => {
    const iskeynamevalid = apikeyname.trim().length > 0;

    if (!iskeynamevalid) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Provide a name for your key', 'error', true);
      return;
    };

    const isTokenLimitValid = Number(apikeytokenlimit) <= Number(clienttokenlimit);

    if (!isTokenLimitValid) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Please specify a token limit lower than your monthly limit');
      return;
    };

    try {
      const response = await axios.post(`/api/save-new-key/`, {
        name_of_key: String(apikeyname), 
        is_active: Boolean(apikeyisactive),
        tokens_limit: Number(apikeytokenlimit),
      }, 
      {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken, },
      }
    );
    if (response.status === 200) {
      window.scrollTo({top: 0, behavior: 'smooth'}); 
      const data = response.data 
      setKey(data.raw_key);
      onShowAlert('API Key created and saved. Copy key now — you will not see it again', 'success', true);
    }
    } catch (error) {
      console.error("Failed to save key", error);
      
      let message = "Something went wrong while saving the API key.";

      if (error.response?.data?.message) {
        // Message returned by your Django backend
        message = error.response.data.message;
      } else if (error.request) {
        // Request was sent but no response was received
        message = "Unable to reach the server. Please try again.";
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      onShowAlert(message, "error", true);
    }
  };


  const onChangeKeyName = (value) => {
    setAPIKeyName(value);
  };


  const onChangeKeyActive = () => {
    setAPIKeyIsActive(!apikeyisactive);
  };


  const onCreateNewKey = () => {
    setAPIKeyName('');
    setKeyActive(true);
    setKey('-');
    onShowAlert('', '', false);   
  };


  const onChangeKeyTokenLimit = (value) => {
    setAPIKeyTokenLimit(value ?? 0);
  };


	return (
		<>
      <Layout>
        <Card
          style={{ borderColor: '#FFF', }}
          bodyStyle={{ paddingTop: 10, paddingLeft: 10, }}
        >
        {showalert && (
          <div className='sig-form-alert'>
          <Alert
            message={alertmessage}
            type={alerttype}
            showIcon
          />
          </div>
        )}

        <Row>
          <Col span={12}>
            <CompClientUsername
              clientusername={user.username}
            />
          </Col>
          <Col span={12}>
            <CompClientTokenLimit 
              clienttokenlimit={clienttokenlimit}
            />
          </Col>
        </Row>

        <Row style={{ marginTop: 35, }}>
          <Col span={12}>
            <CompClientTotalUsedTokens 
              clienttotalusedtokens={clienttotalusedtokens}
            />
          </Col>
        </Row>
        
        <Divider />

        <Row>
          <Col span={12}>
            <CompInputName 
              apikeyname={apikeyname}
              onChangeKeyName={onChangeKeyName}
            />              
          </Col>
          <Col span={12}>
            <CompKeyTokenLimit 
              apikeytokenlimit={apikeytokenlimit}
              onChangeKeyTokenLimit={onChangeKeyTokenLimit}
            />
          </Col>
        </Row>

        <Row style={{ marginTop: 35, }}>
          <Col span={12}>
            <CompKeyActive 
              apikeyisactive={apikeyisactive}
              onChangeKeyActive={onChangeKeyActive}
            />
          </Col>
          <Col span={12}>
            <CompKeyDateCreated />
          </Col>
        </Row>

        <Divider />
          
        <Row>
          <Col span={12}>
            <CompKey 
              keygenerated={keygenerated}
            />
          </Col>    
        </Row>
        
        <Divider />

        <Row style={{ marginTop: 25, }}>
          <Col span={12}>
            <Button 
              type='primary'
              onClick={onSaveKey}
            >
            Generate new key and save 
            </Button>

            <Button 
              onClick={onCreateNewKey}
              style={{ marginLeft: 15, }}
            >
            Clear fields
            </Button>
          </Col>
        </Row>  
        </Card>
      </Layout>
		</>
	);
};
export default APIAppAdd;


