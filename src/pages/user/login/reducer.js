import {LOGIN_SUBMIT,FILED_CHANGE} from './action';

const initState={
  "username":"",
  "password":""
};

export const handleSubmit=(state=initState,action)=>{
  switch(action.type){
    case LOGIN_SUBMIT:
      
  }
}

export const handleChange=(state=initState,action)=>{
  const key = action.payload.key;
  const value = action.payload.value;
  switch(action.type){
    case FILED_CHANGE:
      return {
        ...state,
        [key]:value
      }
    default:
      return state  
  }
}
