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
  } from 'antd';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from "./AuthProvider.js";
import APINoAccessApp from './APINoAccessApp.js';



function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].toString().replace(/^([\s]*)|([\s]*)$/g, ""); 
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}


var csrftoken = getCookie('csrftoken');


const CompClientUsername = ({ clientusername }) => {
  return (
    <>
      <div className="sig-form-header">
        Client username
      </div>
      <div className='sig-form-input'>
        {clientusername}
      </div>
    </>
  );
};


const InputName = ({ apikeyname, onChangeKeyName }) => {
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


const CompDateActivation = () => {
  return (
    <>
      <div className="sig-form-header">
        Date of activation
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


const CompRateLimit = ({ ratelimit }) => {
  return (
    <>
      <div className="sig-form-header">
        Client token limit
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
        {ratelimit}
      </div>
    </>
  );
};


const CompUsedTokens = ({ usedtokens }) => {
  return (
    <>
      <div className="sig-form-header">
        Tokens used
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
        {usedtokens}
      </div>
    </>
  );
};


const CompKeyActive = ({ keyactive, onChangeKeyActive }) => {
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
          checked={keyactive}
        />
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
  const [clientusername, setAPIClientUsername] = useState(user.username);
  const [ratelimit, setRateLimit] = useState(0);
  const [usedtokens, setUsedTokens] = useState(0);
  const [apikeyname, setAPIKeyName] = useState('');
  const [keyactive, setKeyActive] = useState(true);
  const [keygenerated, setKey] = useState('-----------------------------------------');
  const [showalert, setShowAlert] = useState(false);
  const [alertmessage, setAlertMessage] = useState('');
  const [alerttype, setAlertType] = useState('');
  const [alertdescription, setAlertDescription] = useState('');


  useEffect(() => {
    const fetchAPIClient = async () => {
      const response = await axios.get(`/api/APIClientUser`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      })
      const clientdata = response.data[0]
      setRateLimit(Number(clientdata.rate_limit) || 0);
      setUsedTokens(clientdata.tokens_used || 0);
      };
      fetchAPIClient();
  }, [])


  const onShowAlert = (message, description, type, show) => {
    setAlertMessage(message);
    setAlertDescription(description);
    setAlertType(type);
    setShowAlert(show);
  };


  const onSaveKey = async () => {
    const iskeynamevalid = apikeyname.trim().length > 0;

    if (!iskeynamevalid) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Error', 'Provide a name for your key', 'error', true);
      return;
    };

    try {
      const response = await axios.post(`/api/save-new-key/`, {
        name_of_key: String(apikeyname), 
        is_active: Boolean(keyactive),
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
      onShowAlert('Success', 'API Key created and saved. Copy key now — you will not see it again', 'success', true);
    }
    } catch (error) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Error', 'Failed to save key', 'error', true);
    }
  };


  const onChangeKeyName = (value) => {
    setAPIKeyName(value);
  };


  const onChangeKeyActive = () => {
    setKeyActive(!keyactive);
  };


  const onCreateNewKey = () => {
    setAPIKeyName('');
    setKeyActive(true);
    setKey('-----------------------------------------');
    onShowAlert('', '', '', false);   
  }


	return (
		<>
      <Layout>
        <Card
            style={{ borderColor: '#FFF', }}
            bodyStyle={{ paddingTop: 10, paddingLeft: 10, }}
          >
          {(user?.subscription_type === "API") ? (
          <>
            {showalert && (
              <div className='sig-form-alert'>
              <Alert
                message={alertmessage}
                description={alertdescription}
                type={alerttype}
                showIcon
              />
              </div>
            )}

            <Row>
              <Col span={12}>
                <CompClientUsername
                  clientusername={clientusername}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Row>
              <Col span={12}>
                <CompRateLimit 
                  ratelimit={ratelimit}
                />
              </Col>
              <Col span={12}>
                <CompUsedTokens
                  usedtokens={usedtokens}
                />
              </Col>  
            </Row>

            <Divider />

            <Row>
              <Col span={12}>
                <InputName 
                  apikeyname={apikeyname}
                  onChangeKeyName={onChangeKeyName}
                />              
              </Col>
              <Col span={12}>
                <CompDateActivation />
              </Col>
            </Row>

            <Divider />
              
            <Row>
              <Col span={12}>
                <CompKeyActive 
                  keyactive={keyactive}
                  onChangeKeyActive={onChangeKeyActive}
                />
              </Col>
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
                Add new key
                </Button>
              </Col>
            </Row>  
          </>
          ) : (
          <>
            <APINoAccessApp />
          </>
        )
        }
        </Card>
      </Layout>
		</>
	);
};
export default APIAppAdd;


