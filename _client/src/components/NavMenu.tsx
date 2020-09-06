import React from 'react';
// import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Navbar, Container, NavbarBrand, Collapse, NavItem } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import './NavMenu.css';
import { pageLinks } from '../pageLinks';
import { getUser, appDispatcher } from '../init';
import { AppBar, Toolbar, IconButton, Typography, Button, Menu, MenuItem } from '@material-ui/core';
import CodeIcon from '@material-ui/icons/Code';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CancelIcon from '@material-ui/icons/Cancel';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { SimpleLoader } from './SimpleLoader';

interface NavMenuProps {

}


export const NavMenu = (props: NavMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [user, setUser] = React.useState(getUser());

  appDispatcher.register((payload: any) => {
    if (payload.actionType == "userChanged") {
      setUser(getUser());
    }
  });

  if (!user.role) {
    return <SimpleLoader />
  }
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const isRoot = user.role === "root";
  const canBeRoot = !!~user.roles.indexOf("root");

  const accountMenuId = 'primary-search-account-menu';
  const notificationsMenuId = 'primary-search-notifications-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={accountMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem disabled>{user.username} (<small>{user.id}</small>)</MenuItem>
      {isRoot &&
        <MenuItem onClick={() => {
          user.role = "student";
          setUser(user);
          handleMenuClose();
        }}>
          <SupervisorAccountIcon />Switch to role student
        </MenuItem>
      }
      {!isRoot && canBeRoot &&
        <MenuItem onClick={() => {
          user.role = "root";
          setUser(user);
          handleMenuClose();
        }}>
          <SupervisorAccountIcon />Switch back to root
        </MenuItem>
      }
      <MenuItem onClick={() => {
        fetch("home/logout")
          .then(data => {
            window.location.href = "https://flowdb.nti.tul.cz/secure/";
          })
      }}>
        <CancelIcon />Logout
      </MenuItem>
    </Menu>
  );

  const availLinks = pageLinks
    .filter(i => !i.rootOnly || (i.rootOnly && user.role === "root"));

  return <>
    <AppBar position="static" className="mb-2">
      <Toolbar className="container">
        <IconButton edge="start" color="inherit" component={Link} to="/">
          <CodeIcon />
        </IconButton>
        <Typography variant="h6">Code Critic</Typography>

        <div style={{ flexGrow: 1 }} />


        {availLinks.map(i =>
          <MenuItem key={i.path} component={Link} to={i.to}>{i.title}</MenuItem>
        )}
        <IconButton
          edge="end"
          color="inherit"
          aria-haspopup="true"
          aria-controls={notificationsMenuId}
          onClick={handleProfileMenuOpen}>
          <NotificationsIcon />
        </IconButton>

        <IconButton
          color="inherit"
          aria-haspopup="true"
          aria-controls={accountMenuId}
          onClick={handleProfileMenuOpen}>
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
    {renderMenu}
  </>
}
