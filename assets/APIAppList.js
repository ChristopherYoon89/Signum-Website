import React, { useState, useEffect } from 'react';
import {
	Button,
  Layout,
  Tooltip,
  } from 'antd';
import {
	QuestionCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from "./AuthProvider.js";
import APINoAccessApp from './APINoAccessApp.js';
import { getCookie } from './ManagerUtility.js';
import TableAPIKeys from './TableAPIKeys.js';


var csrftoken = getCookie('csrftoken');



const APIAppList = () => {
  const { isauthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabledata, setTableData] = useState([]);
  const [clientusername, setAPIClientUsername] = useState(user.username);
  const [ratelimit, setRateLimit] = useState(0);
  const [usedtokens, setUsedTokens] = useState(0);
  
  const [showalert, setShowAlert] = useState(false);
  const [alertmessage, setAlertMessage] = useState('');
  const [alerttype, setAlertType] = useState('');


  useEffect(() => {
    const fetchAPIKeys = async () => {
      try {
        const response = await axios.get("/api/APIKeyAllUser", {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken,
          },
        });

        const apikeylist = response.data.map(row => ({
          id: row.id,
          name_of_key: row.name_of_key,
          is_active: row.is_active,
          date_created: moment(row.date_created),
          tokens_limit: row.tokens_limit,
          total_tokens_used: row.total_tokens_used,
          total_request_count: row.total_request_count
        }));

        setTableData(apikeylist);
      } catch (error) {
        console.error("Fetching API keys failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAPIKeys();
  }, []);

	return (
		<>
      <Layout>
        <div className="div-data-manager">
          { loading ? (

            <div className="table-sync-container">
           	<SyncOutlined spin style={{color: "#5e5e5e", fontSize: 24,}}/>
            </div>

          ) : (
            <>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', }} >
              <TableAPIKeys 
                tabledata={tabledata}
              />
              </div>
            </>
          )
          }
        </div>
      </Layout>
		</>
	);
};
export default APIAppList;


