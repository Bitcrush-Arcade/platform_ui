 import { Theme, withStyles, WithStyles, createStyles } from "@material-ui/core/styles"
 import TextField, {TextFieldProps} from "@material-ui/core/TextField"

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