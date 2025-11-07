import type { ReactNode } from 'react';

import { Grid, Box } from '@mui/material';
import { Lock } from '@mui/icons-material';

interface AuthLayoutProps {
  children: ReactNode;
  image?: string;
  title?: string;
  subtitle?: string;
}

function AuthLayout({ children, image, title, subtitle }: AuthLayoutProps) {


  return (
    <div className="container-fluid" style={{ minHeight: '100vh', padding: 0 }}>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* LEFT SIDE - STATIC (Same for all pages) */}
        <Grid 
          item
          xs={12}
          lg={6} 
          sx={{ 
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            background: 'linear-gradient(135deg, #2962FF 0%, #00BFA5 100%)',
          }}
        >
          <Box sx={{ textAlign: 'center', px: 5 }}>
            {/* Logo - STATIC */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <Lock sx={{ fontSize: 42, marginRight: 2 }} />
              <h2 style={{ fontWeight: 'bold', margin: 0 }}>SparkLMS</h2>
            </Box>

            {/* Image - DYNAMIC (Changes per page) */}
            <img 
              src={image} 
              alt="Illustration" 
              style={{ maxWidth: '350px', height: '200px', margin: '2rem 0' }}
            />

            {/* Text - STATIC */}
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
              {title || 'Secure Your Digital Life'}
            </h2>
            <p style={{ fontSize: '1.125rem', opacity: 0.75 }}>
              {subtitle || 'Manage all your passwords in one secure place.'}
            </p>
          </Box>
        </Grid>

        {/* RIGHT SIDE - DYNAMIC (Changes per page) */}
        <Grid 
          item
          xs={12}
          lg={6} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            bgcolor: '#f5f5f5', 
            p: 4 
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '450px' }}>
            {/* Mobile Logo */}
            <Box sx={{ display: { lg: 'none' }, textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#2962FF' }}>
                <Lock sx={{ fontSize: 40, marginRight: 1 }} />
                <h2 style={{ fontWeight: 'bold', margin: 0 }}>SparkLMS</h2>
              </Box>
            </Box>

            {/* Dynamic Content (Login/Register/Forgot forms) */}
            {children}
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

export default AuthLayout;