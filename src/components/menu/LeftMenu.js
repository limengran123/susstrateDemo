/*
 * @Author: your name
 * @Date: 2020-06-02 10:27:36
 * @LastEditTime: 2020-06-02 15:03:42
 * @LastEditors: Please set LastEditors
 * @Description: 侧边栏菜单
 * @FilePath: \substrate-web\src\components\SideBar.js
 */
import React from 'react';
import { Menu } from 'semantic-ui-react'
import './MenuItem.css';
import * as COMMON from '../../tools/CommonConstant';
import { connect } from 'react-redux';
import { getMenuDataAction } from '@/actions/menuAction';

let menuItemObj = COMMON.menuItemObj;

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      activeItem: '',
      showContent: false,
      did: "",
    }
  }

  componentDidMount() {
    let orgDidStr;
    let userName = window.location ? window.location.pathname.slice(1) : "police";
    if (this.state.user === "policeUser") {
      let fileinforStr = localStorage.getItem('fileinformation');
      let fileinformation = fileinforStr ? JSON.parse(fileinforStr) : {};
      let name = fileinformation.name || "";
      orgDidStr = localStorage.getItem('userHasDid' + name);
    } else {
      orgDidStr = localStorage.getItem('orgrHasDid' + userName);
    }
    let orgDidObj = orgDidStr ? JSON.parse(orgDidStr) : {};
    let did;
    if (this.state.user === "policeUser") {
      let fileinforStr = localStorage.getItem('fileinformation');
      let fileinformation = fileinforStr ? JSON.parse(fileinforStr) : {};
      let name = fileinformation.name || "";
      did = orgDidObj[name];
    } else {
      let userName = COMMON.ORG_TO_USERNAME[this.state.user];
      did = orgDidObj[userName];
    }


    if (this.props.menuTagData.length === 0) {
      if (did && this.state.user === "police") {
        this.setState({
          activeItem: "调用人员DID生成",
        });
        this.props.GET_MENU_DATA("调用人员DID生成");
      }
      if (!did) {
        menuItemObj = {
          "police": ["DID生成", "调用人员DID生成"],
          "ccb": ["DID生成"],
          "fintech": ["DID生成"],
          "policeUser": ["申请调用", "调用结果", "授权书管理"],
        };

        this.setState({
          activeItem: menuItemObj[this.state.user][0],
        });
        this.props.GET_MENU_DATA(menuItemObj[this.state.user][0]);
      } else {
        if (this.state.user === "police") {
          this.setState({
            activeItem: "调用人员DID生成",
          });
          this.props.GET_MENU_DATA("调用人员DID生成");
        } else {
          menuItemObj = COMMON.menuItemObj;
          this.setState({
            activeItem: menuItemObj[this.state.user][0],
            did: did
          });
          this.props.GET_MENU_DATA(menuItemObj[this.state.user][0]);
        }
      }

    }
    if (this.state.user === "policeUser") {
      this.props.GET_MENU_DATA(menuItemObj[this.state.user][2]);
      this.setState({
        activeItem: menuItemObj[this.state.user][2],
        did: did
      });
    }

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.menuTagData === "DID生成" || nextProps.menuTagData === "调用人员DID生成") {
      menuItemObj = {
        "police": ["DID生成", "调用人员DID生成"],
        "ccb": ["DID生成"],
        "fintech": ["DID生成"],
        "policeUser": ["申请调用", "调用结果", "授权书管理"],
      };
      this.setState({
        activeItem: nextProps.menuTagData,
      });
    } else {
      menuItemObj = COMMON.menuItemObj;
      this.setState({ activeItem: nextProps.menuTagData });
    }
  }


  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
    this.props.GET_MENU_DATA(name);
  }


  render() {


    const menyItemArr = menuItemObj[this.state.user];
    return (
      <Menu inverted pointing vertical className="MenuItem">
        {
          menyItemArr.map((item, key) => {
            return <Menu.Item
              key={item}
              name={item}
              active={this.state.activeItem === item}
              onClick={this.handleItemClick}
            />
          })
        }
      </Menu>
    )
  }
}

const mapStateToProps = state => {
  return state
}

const mapDispatchToProps = (dispatch) => {
  return {
    'GET_MENU_DATA': (payload) => {
      dispatch(getMenuDataAction(payload));
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu)


