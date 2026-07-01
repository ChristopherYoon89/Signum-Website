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
  InputNumber,
  Alert, 
  } from 'antd';
import {
  useParams,
} from 'react-router-dom';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from "./AuthProvider.js";
import moment from 'moment-timezone';
import APINoAccessApp from './APINoAccessApp.js'; 
import { getCookie } from './ManagerUtility.js';


var csrftoken = getCookie('csrftoken');


const CompClientUsername = ({ clientusername }) => {
  return (
    <>
      <div className="sig-form-header">
        Username
        <span>
          <Tooltip
            placement='right'
            title='To change your username go to the profile section
            of the dashboard side menu'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        {clientusername}
      </div>
    </>
  );
};


const CompGlobalTokensLimit = ({ usermonthlytokenlimit }) => {
  return (
    <>
      <div className='sig-form-header'>
        Monthly token limit
        <span>
        <Tooltip
            placement='right'
            title='To change your monthly token limit contact customer 
            support'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>

      <div className='sig-form-input'>
        {usermonthlytokenlimit}
      </div>
    </>
  );
};


const CompGlobalTokensUsage = ({ usertotaltokenusage }) => {
  return (
    <>
      <div className='sig-form-header'>
        Total token usage
        <span>
        <Tooltip
            placement='right'
            title='Total token usage '
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>

      <div className='sig-form-input'>
        {usertotaltokenusage}
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


const CompDateCreated = ({ apikeydatecreated }) => {
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
        {String(apikeydatecreated)}
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


const CompTokensLimit = ({ apikeytokenslimit, handleKeyTokensLimit }) => {
  return (
    <>
      <div className="sig-form-header">
        Key's token limit
        <span>
          <Tooltip
            placement='right'
            title='Maximum number of tokens that can be used by this key'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        <InputNumber
          min={0}
          value={apikeytokenslimit}
          onChange={handleKeyTokensLimit}
          style={{ width: 400, }}
        />
      </div>
    </>
  );
};



const CompUsedTokens = ({ apikeytokensused }) => {
  return (
    <>
      <div className="sig-form-header">
        Key token usage
        <span>
          <Tooltip
            placement='right'
            title='Number of tokens already used with this key'
          >
          <QuestionCircleOutlined className="sig-form-info-icon"	/>
          </Tooltip>
        </span>
      </div>
      <div className='sig-form-input'>
        {apikeytokensused}
      </div>
    </>
  );
};


const CompAPIKeyRequestCount = ({ apikeyrequestcount }) => {
  return(
    <>
      <div className='sig-form-header'>
      Total request count  
      </div>  
      <div className='sig-form-input'>
        {apikeyrequestcount}
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
  const [userratelimit, setUserRatelimit] = useState(0);
  const [usermonthlytokenlimit, setUserMonthlyTokenLimit] = useState(0);
  const [usertotaltokenusage, setUserTotalTokenUsage] = useState(0);

  const [apikeyname, setAPIKeyName] = useState('');
  const [apikeyisactive, setAPIKeyIsActive] = useState(false);
  const [apikeydatecreated, setAPIKeyDateCreated] = useState('');
  
  const [apikeytokenslimit, setAPIKeyTokensLimit] = useState(0);
  const [apikeytokensused, setAPIKeyTokensUsed] = useState(0);
  const [apikeyrequestcount, setAPIKeyRequestCount] = useState(0);
  
  const [keygenerated, setKey] = useState('');
  
  const [showalert, setShowAlert] = useState(false);
  const [alertmessage, setAlertMessage] = useState('');
  const [alerttype, setAlertType] = useState('');

  const { apikey_id } = useParams();


  const onShowAlert = (message, type, show) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(show);
  };


  const onSaveKey = async () => {
    const iskeynamevalid = apikeyname.trim().length > 0;
    
    if (!iskeynamevalid) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Please provide a name for your key', 'error', true);
      return;
    };

    const isTokenLimitValid = Number(apikeytokenslimit) <= Number(usermonthlytokenlimit);

    if (!isTokenLimitValid) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Please specify a token limit lower than your monthly limit');
    };

    try {
      const response = await axios.patch(`/api/update-key/`, {
        key_id: Number(apikey_id),
        name_of_key: String(apikeyname),
        tokens_limit: Number(apikeytokenslimit), 
        is_active: Boolean(apikeyisactive),
      }, 
      {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken, },
      }
    );
    if (response.status === 200) {
      window.scrollTo({top: 0, behavior: 'smooth'}); 
      onShowAlert('Changes saved', 'success', true);
    }
    } catch (error) {
      console.log(`Error updating the key`, error);
      window.scrollTo({top: 0, behavior: 'smooth'});
      onShowAlert('Update failed', 'error', true);
    }
  };

  useEffect(() => {
  const fetchSingleAPI = async () => {
    try {
      const response = await axios.get(`/api/fetch-single-key/?id=${apikey_id}`, {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });

      const api = response.data;

      console.log(api);

      setUserRatelimit(api.user_rate_limit || 0);
      setUserMonthlyTokenLimit(api.user_monthly_token_limit || 0);
      setUserTotalTokenUsage(api.user_total_token_usage || 0);
      setAPIKeyName(api.api_key_name || '-');
      setAPIKeyIsActive(Boolean(api.api_key_is_active) || false);
      setAPIKeyDateCreated(moment(api.api_key_date_created).format("YYYY-MM-DD") || '-');
      setAPIKeyTokensLimit(api.api_key_tokens_limit || 0);
      setAPIKeyTokensUsed(api.api_key_tokens_used || 0);
      setAPIKeyRequestCount(api.api_key_request_count || 0);      
      setKey('****************************************************************');

    } catch (error) {
      console.error('Failed to fetch single API', error);
    }
  };
  fetchSingleAPI();
  }, []);


  const onChangeKeyName = (value) => {
    setAPIKeyName(value);
  };


  const onChangeKeyActive = () => {
    setAPIKeyIsActive(!apikeyisactive);
  };


  const handleKeyTokensLimit = (value) => {
    console.log(value);
    setAPIKeyTokensLimit(value ?? 0);
  };


  const handleUpdateKey = async () => {
    try {
      const response = await axios.post(`/api/generate-new-apikey/?id=${apikey_id}`,
      {},
      {
        withCredentials: true,
        headers: { "X-CSRFToken": csrftoken },
      });

      const apikey = response.data 
      setKey(apikey.raw_key);

      onShowAlert('New key successfully saved', 'success', true)

    } catch (error) {
      onShowAlert('Saving of the new key failed. Try again later.', 'error', true)
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
              <CompGlobalTokensLimit 
                usermonthlytokenlimit={usermonthlytokenlimit}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: 35, }}>
            <Col span={12}>
              <CompGlobalTokensUsage 
                usertotaltokenusage={usertotaltokenusage} 
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
              <CompTokensLimit 
                apikeytokenslimit={apikeytokenslimit}
                handleKeyTokensLimit={handleKeyTokensLimit}
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
              <CompDateCreated 
                apikeydatecreated={apikeydatecreated}
              />
            </Col>
              
          </Row>
            
          <Row style={{ marginTop: 35, }}>
            <Col span={12}>
              <CompUsedTokens
                apikeytokensused={apikeytokensused}
              />
            </Col>    
          </Row>

          <Divider />

          <Row>
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
      </Card>
    </Layout>
		</>
	);
};
export default APIAppEdit;


