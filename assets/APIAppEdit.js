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
  Select,
  Divider,
  Alert, 
  } from 'antd';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from "./AuthProvider.js";
import moment from 'moment-timezone';
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


const SelectAPI = ({ selectedapi, allapis, onChangeSelectAPI }) => {
  return (
    <>
      <div className="sig-form-header">
        Select API key
        <span>
          <Tooltip
            placement='right'
            title='Select the API key you want to view or edit'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        <Select
          className='sig-form-select'
          value={selectedapi}
          style={{ width: 400, }}
          onChange={onChangeSelectAPI}
          options={allapis}
        />
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


const CompDateActivation = ({ dateofactivation }) => {
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
        {String(dateofactivation)}
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
        Token usage
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


const CompKey = ({ keygenerated, handleUpdateKey }) => {
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
        <div className="api-key-button">
          <Button
            onClick={() => handleUpdateKey()}
          >
            Generate New Key
          </Button>
        </div>
        <div className="api-key-description">
        <small>Please store the newly generated key securely.</small>
        </div>
      </div>
    </>
  );
};


const APIAppEdit = () => {
  const { isauthenticated, user } = useAuth();
  const [selectedapi, setSelectedAPI] = useState('');
  const [clientusername, setAPIClientUsername] = useState(user.username);
  const [dateofactivation, setDateOfActivation] = useState('');
  const [ratelimit, setRateLimit] = useState('');
  const [usedtokens, setUsedTokens] = useState('');
  const [apikeyname, setAPIKeyName] = useState('');
  const [keyactive, setKeyActive] = useState(false);
  const [keygenerated, setKey] = useState('');
  const [showalert, setShowAlert] = useState(false);
  const [alertmessage, setAlertMessage] = useState('');
  const [alerttype, setAlertType] = useState('');
  const [alertdescription, setAlertDescription] = useState('');
  const [allapis, setAllAPIs] = useState([]);
  const [showformapi, setShowFormAPI] = useState(false);


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
      const response = await axios.patch(`/api/update-key/`, {
        key_id: Number(selectedapi),
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
      onShowAlert('Success', 'Changes saved', 'success', true);
    }
    } catch (error) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Error', 'Failed to update failed', 'error', true);
    }
  };


  useEffect(() => {
		const fetchAllAPIKeys = async () => {
		try { 
			const response = await axios.get(`/api/APIKeyAllUser`);
			const mappedkeys = response.data.map((row) => ({
							value: row.id,
							label: row.name_of_key,
						}));
					setAllAPIs(mappedkeys);
					} catch (error) {
						console.error('Failed to fetch user api keys');
					};
		}
		fetchAllAPIKeys();
	}, []);


  const fetchSingleAPI = async (apikey_id) => {
    try {
      const response = await axios.get(`/api/fetch-single-key/?id=${apikey_id}`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });

      const api = response.data;

      setDateOfActivation(moment(api.date_activation).format("YYYY-mm-DD") || '');
      setRateLimit(api.rate_limit || '');
      setUsedTokens(api.tokens_used || 0);
      setAPIKeyName(api.api_key_name || '');
      setKeyActive(Boolean(api.api_is_active) || false);
      setKey('****************************************************************');

    } catch (error) {
      console.error('Failed to fetch single API');
    }
  };


  const onChangeSelectAPI = (value) => {
    setSelectedAPI(value);
    fetchSingleAPI(value);
    setShowFormAPI(true);
  };


  const onChangeKeyName = (value) => {
    setAPIKeyName(value);
  };


  const onChangeKeyActive = () => {
    setKeyActive(!keyactive);
  };


  const handleUpdateKey = async () => {
    try {
      const response = await axios.post(`/api/generate-new-apikey/?id=${selectedapi}`,
      {},
      {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });

      const apikey = response.data 
      setKey(apikey.raw_key);

      onShowAlert('Success', 'New key successfully saved', 'success', true)

    } catch (error) {
      onShowAlert('Error', 'Saving of the new key failed. Try again later.', 'error', true)
    }
  }


	return (
		<>
    <Layout>
      <Card
        className='dashboard-feed-bord'
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
              <SelectAPI 
                selectedapi={selectedapi}
                allapis={allapis}
                onChangeSelectAPI={onChangeSelectAPI}
              />
            </Col>
          </Row>

          {showformapi && (
          <div>

          <Divider />

          <Row>
            <Col span={12}>
              <InputName 
                apikeyname={apikeyname}
                onChangeKeyName={onChangeKeyName}
              />
              
            </Col>
            <Col span={12}>
              <CompDateActivation 
                dateofactivation={dateofactivation}
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
              <CompKeyActive 
                keyactive={keyactive}
                onChangeKeyActive={onChangeKeyActive}
              />
            </Col>
            <Col span={12}>
              <CompKey 
                keygenerated={keygenerated}
                handleUpdateKey={handleUpdateKey}
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
              Save changes 
              </Button>
            </Col>
          </Row>  
          </div>
          )}
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
export default APIAppEdit;


