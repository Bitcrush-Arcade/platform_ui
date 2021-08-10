// Material
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import Avatar from "@material-ui/core/Avatar"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import Typography from "@material-ui/core/Typography"
// Material Icons
import AddIcon from "@material-ui/icons/Add"
import RemoveIcon from "@material-ui/icons/Remove"
// Bitcrush
import Card from "components/basics/Card"
import SmBtn from "components/basics/SmallButton"
import TextField from "components/basics/TextField"
// Hooks
import useBank from "hooks/bank"
// Icons
import InvaderIcon from "components/svg/InvaderIcon"

function BankPool( ) {
  const css = useStyles()

  const { bankInfo, userInfo } = useBank()

  return (
    <Card className={ css.card } >
      <Grid container justify="space-between">
        {/* STAKE INTERACTIVE AREA */}
        <Grid item xs={12} md={5}>
          <Typography variant="h4" component="div" className={ css.heavier }>
            STAKED
          </Typography>
          <Grid container justify="space-between">
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                Staked
              </Typography>
              <Typography variant="h6" component="div" color="primary" className={ css.heavy }>
                {userInfo.staked}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Your Stake {userInfo.staked / ( bankInfo.bankRoll || 1 )}%
              </Typography>
            </Grid>
            <Grid item>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Typography variant="h6" component="div" style={{ fontFamily: 'Zebulon', letterSpacing: 2 }} display="inline">
                    BITCRUSH
                  </Typography>
                </Grid>
                <Grid item>
                  <Avatar className={ css.avatar }>
                    <InvaderIcon color="action" />
                  </Avatar>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <TextField 
            type="number"
            variant="outlined"
            placeholder="Stake / Unstake Amount"
            fullWidth
            onFocus={ e => e.target.select() }
            InputProps={{
              endAdornment: <>
                <IconButton color="primary" className={ `${css.icnBtn} ${css.addIcn}` } style={{marginRight: 4}} >
                  <AddIcon color="action"/>
                </IconButton>
                <IconButton color="primary" className={ `${css.icnBtn} ${css.removeIcn}` } >
                  <RemoveIcon color="action"/>
                </IconButton>
              </>
            }}
          />
          <Grid container justify="center" spacing={2} className={ css.actionBtns } >
            <Grid item>
              <SmBtn color="primary">
                Compount
              </SmBtn>
            </Grid>
            <Grid item>
              <SmBtn color="primary">
                Harvest
              </SmBtn>
            </Grid>
            <Grid item>
              <SmBtn color="primary">
                Transfer
              </SmBtn>
            </Grid>
          </Grid>
        </Grid>
        {/* STAKE INFORMATION AREA */}
        <Grid item xs={12} md={5}>
        </Grid>
      </Grid>
      {/* STAKE COLLAPSABLE AREA */}
    </Card>
  )
}

export default BankPool

const useStyles = makeStyles<Theme>( theme => createStyles({
  actionBtns:{
    marginTop: theme.spacing(2)
  },
  avatar:{
    backgroundColor: theme.palette.primary.main,
    width: 36,
    height: 36,
  },
  card:{
    width: '80%',
    [theme.breakpoints.up('md')]:{
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  heavy:{
    fontWeight: 500
  },
  heavier:{
    fontWeight: 600
  },
  icnBtn:{
    border: `1px solid ${theme.palette.primary.main}`,
    padding: 8,
    background: `radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%,${theme.palette.shadow.primary.main} 80%, ${theme.palette.shadow.primary.main} 85%)`
  },
  addIcn:{
    borderTopRightRadius: 0,
  },
  removeIcn:{
    borderTopLeftRadius: 0,
  },
}))