 import { Theme } from "@mui/material/styles";
 import { WithStyles } from '@mui/styles';
 import withStyles from '@mui/styles/withStyles';
 import createStyles from '@mui/styles/createStyles';
 import TextField, {TextFieldProps} from "@mui/material/TextField"

 const styles = (theme: Theme) => createStyles({
   root:{
    borderRadius: theme.spacing(4),
    paddingLeft: theme.spacing(2),
   }
 })

 type CustomTextFieldStyles = {} & WithStyles< typeof styles > & TextFieldProps

 export default withStyles(styles) ( (props: CustomTextFieldStyles ) => {
   const { classes, ...otherProps } = props
   return <TextField 
      {...otherProps}
      InputProps={{
        ...otherProps.InputProps,
        classes: classes
      }}
    /> 
 })