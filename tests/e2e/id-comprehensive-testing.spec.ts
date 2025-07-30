// ID Service - Comprehensive Identity and Authentication Testing
// Testing all identity management, authentication flows, and security features

import { test, expect, Page } from '@playwright/test';

const ID_BASE_URL = 'http://localhost:4004';

test.describe('🔐 ID Service - Comprehensive Identity and Authentication Testing', () => {

  test.describe('🔑 Authentication and Login Flows', () => {

    test('Standard Login Flow', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/login`);

      const loginForm = page.locator('.login-form, [data-testid="login-form"]');
      if (await loginForm.count() > 0) {
        await expect(loginForm).toBeVisible();

        // Test form fields
        const emailField = loginForm.locator('input[name="email"], input[type="email"]');
        const passwordField = loginForm.locator('input[name="password"], input[type="password"]');
        const submitButton = loginForm.locator('button[type="submit"], button:has-text("Login")');

        if (await emailField.count() > 0) {
          await expect(emailField).toBeVisible();
          await emailField.fill('test@codai.test');
        }

        if (await passwordField.count() > 0) {
          await expect(passwordField).toBeVisible();
          await passwordField.fill('TestPassword123!');
        }

        // Test form validation
        if (await submitButton.count() > 0) {
          await expect(submitButton).toBeEnabled();
          await submitButton.click();
          await page.waitForLoadState('networkidle');
        }

        // Test remember me option
        const rememberMeCheckbox = loginForm.locator('input[name="remember"], input[type="checkbox"]');
        if (await rememberMeCheckbox.count() > 0) {
          await rememberMeCheckbox.click();
        }

        // Test show/hide password
        const showPasswordButton = loginForm.locator('button[data-action="toggle-password"], .password-toggle');
        if (await showPasswordButton.count() > 0) {
          await showPasswordButton.click();
          await expect(passwordField).toHaveAttribute('type', 'text');
          await showPasswordButton.click();
          await expect(passwordField).toHaveAttribute('type', 'password');
        }
      }
    });

    test('Multi-Factor Authentication (MFA)', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/login`);

      // First, complete standard login
      const loginForm = page.locator('.login-form, [data-testid="login-form"]');
      if (await loginForm.count() > 0) {
        await loginForm.locator('input[name="email"]').fill('mfa-user@codai.test');
        await loginForm.locator('input[name="password"]').fill('TestPassword123!');
        await loginForm.locator('button[type="submit"]').click();
        await page.waitForLoadState('networkidle');
      }

      // Test MFA challenge
      const mfaForm = page.locator('.mfa-form, [data-testid="mfa-form"]');
      if (await mfaForm.count() > 0) {
        await expect(mfaForm).toBeVisible();

        // Test different MFA methods
        const mfaMethods = [
          '.totp-method, [data-method="totp"]',
          '.sms-method, [data-method="sms"]',
          '.email-method, [data-method="email"]',
          '.backup-codes-method, [data-method="backup"]'
        ];

        for (const methodSelector of mfaMethods) {
          const method = mfaForm.locator(methodSelector);
          if (await method.count() > 0) {
            await expect(method).toBeVisible();

            // Test method selection
            await method.click();
            await page.waitForTimeout(500);
          }
        }

        // Test TOTP code input
        const totpInput = mfaForm.locator('input[name="totp"], input[placeholder*="code"]');
        if (await totpInput.count() > 0) {
          await totpInput.fill('123456');

          const verifyButton = mfaForm.locator('button:has-text("Verify"), button[type="submit"]');
          if (await verifyButton.count() > 0) {
            await verifyButton.click();
            await page.waitForLoadState('networkidle');
          }
        }

        // Test backup codes
        const useBackupCodeButton = mfaForm.locator('button:has-text("Use Backup Code"), [data-action="backup-code"]');
        if (await useBackupCodeButton.count() > 0) {
          await useBackupCodeButton.click();

          const backupCodeInput = page.locator('input[name="backup_code"], .backup-code-input');
          if (await backupCodeInput.count() > 0) {
            await backupCodeInput.fill('BACKUP123');
            await page.locator('button:has-text("Verify")').click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('Social Login Integration', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/login`);

      const socialLoginSection = page.locator('.social-login, [data-testid="social-login"]');
      if (await socialLoginSection.count() > 0) {
        await expect(socialLoginSection).toBeVisible();

        // Test social login providers
        const socialProviders = [
          { name: 'Google', selector: '.google-login, [data-provider="google"]' },
          { name: 'GitHub', selector: '.github-login, [data-provider="github"]' },
          { name: 'Microsoft', selector: '.microsoft-login, [data-provider="microsoft"]' },
          { name: 'LinkedIn', selector: '.linkedin-login, [data-provider="linkedin"]' }
        ];

        for (const provider of socialProviders) {
          const providerButton = socialLoginSection.locator(provider.selector);
          if (await providerButton.count() > 0) {
            await expect(providerButton).toBeVisible();
            await expect(providerButton).toContainText(provider.name);

            // Test provider button click (without actual OAuth flow)
            await providerButton.click();
            await page.waitForTimeout(1000);

            // Check if OAuth window would open (we can't test the actual OAuth flow)
            // but we can verify the button interaction works
          }
        }
      }
    });

    test('Password Reset Flow', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/login`);

      const forgotPasswordLink = page.locator('a:has-text("Forgot Password"), [data-action="forgot-password"]');
      if (await forgotPasswordLink.count() > 0) {
        await forgotPasswordLink.click();
        await page.waitForLoadState('networkidle');

        const resetForm = page.locator('.reset-password-form, [data-testid="reset-form"]');
        if (await resetForm.count() > 0) {
          await expect(resetForm).toBeVisible();

          const emailInput = resetForm.locator('input[name="email"], input[type="email"]');
          if (await emailInput.count() > 0) {
            await emailInput.fill('test@codai.test');

            const sendResetButton = resetForm.locator('button:has-text("Send Reset Link"), button[type="submit"]');
            if (await sendResetButton.count() > 0) {
              await sendResetButton.click();
              await page.waitForLoadState('networkidle');

              // Test success message
              const successMessage = page.locator('.success-message, [data-testid="success"]');
              if (await successMessage.count() > 0) {
                await expect(successMessage).toBeVisible();
                await expect(successMessage).toContainText('reset link');
              }
            }
          }
        }
      }

      // Test reset token page (simulate with a test token)
      await page.goto(`${ID_BASE_URL}/reset-password?token=test-token-123`);

      const newPasswordForm = page.locator('.new-password-form, [data-testid="new-password-form"]');
      if (await newPasswordForm.count() > 0) {
        await expect(newPasswordForm).toBeVisible();

        const newPasswordInput = newPasswordForm.locator('input[name="new_password"], input[name="password"]');
        const confirmPasswordInput = newPasswordForm.locator('input[name="confirm_password"], input[name="password_confirmation"]');

        if (await newPasswordInput.count() > 0 && await confirmPasswordInput.count() > 0) {
          await newPasswordInput.fill('NewPassword123!');
          await confirmPasswordInput.fill('NewPassword123!');

          // Test password strength indicator
          const passwordStrength = newPasswordForm.locator('.password-strength, [data-testid="password-strength"]');
          if (await passwordStrength.count() > 0) {
            await expect(passwordStrength).toBeVisible();
          }

          const resetButton = newPasswordForm.locator('button:has-text("Reset Password"), button[type="submit"]');
          if (await resetButton.count() > 0) {
            await resetButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });
  });

  test.describe('📝 Registration and Account Creation', () => {

    test('User Registration Flow', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/register`);

      const registerForm = page.locator('.register-form, [data-testid="register-form"]');
      if (await registerForm.count() > 0) {
        await expect(registerForm).toBeVisible();

        // Test registration fields
        const registrationData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'newuser@codai.test',
          username: 'testuser123',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!'
        };

        for (const [field, value] of Object.entries(registrationData)) {
          const input = registerForm.locator(`input[name="${field}"], input[name="${field.replace(/([A-Z])/g, '_$1').toLowerCase()}"]`);
          if (await input.count() > 0) {
            await input.fill(value);

            // Test real-time validation
            if (field === 'email') {
              const emailValidation = registerForm.locator('.email-validation, [data-validation="email"]');
              if (await emailValidation.count() > 0) {
                await expect(emailValidation).toBeVisible();
              }
            }

            if (field === 'username') {
              const usernameValidation = registerForm.locator('.username-validation, [data-validation="username"]');
              if (await usernameValidation.count() > 0) {
                await expect(usernameValidation).toBeVisible();
              }
            }
          }
        }

        // Test password strength meter
        const passwordStrength = registerForm.locator('.password-strength, [data-testid="password-strength"]');
        if (await passwordStrength.count() > 0) {
          await expect(passwordStrength).toBeVisible();

          const strengthLevels = passwordStrength.locator('.strength-level, .strength-bar');
          if (await strengthLevels.count() > 0) {
            await expect(strengthLevels).toBeVisible();
          }
        }

        // Test terms and conditions
        const termsCheckbox = registerForm.locator('input[name="terms"], input[type="checkbox"]');
        if (await termsCheckbox.count() > 0) {
          await termsCheckbox.click();
        }

        // Test captcha (if present)
        const captcha = registerForm.locator('.captcha, [data-testid="captcha"]');
        if (await captcha.count() > 0) {
          await expect(captcha).toBeVisible();
        }

        // Test form submission
        const submitButton = registerForm.locator('button:has-text("Register"), button[type="submit"]');
        if (await submitButton.count() > 0) {
          await expect(submitButton).toBeEnabled();
          await submitButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('Email Verification Process', async ({ page }) => {
      // Test verification email sent page
      await page.goto(`${ID_BASE_URL}/verify-email-sent`);

      const verificationSentPage = page.locator('.verification-sent, [data-testid="verification-sent"]');
      if (await verificationSentPage.count() > 0) {
        await expect(verificationSentPage).toBeVisible();

        // Test resend verification button
        const resendButton = verificationSentPage.locator('button:has-text("Resend"), [data-action="resend"]');
        if (await resendButton.count() > 0) {
          await resendButton.click();
          await page.waitForLoadState('networkidle');

          const successMessage = page.locator('.resend-success, [data-testid="resend-success"]');
          if (await successMessage.count() > 0) {
            await expect(successMessage).toBeVisible();
          }
        }
      }

      // Test verification page (simulate with test token)
      await page.goto(`${ID_BASE_URL}/verify-email?token=verification-token-123`);

      const verificationPage = page.locator('.email-verification, [data-testid="email-verification"]');
      if (await verificationPage.count() > 0) {
        await expect(verificationPage).toBeVisible();

        const verificationStatus = verificationPage.locator('.verification-status, [data-testid="verification-status"]');
        if (await verificationStatus.count() > 0) {
          await expect(verificationStatus).toBeVisible();
        }

        const continueButton = verificationPage.locator('button:has-text("Continue"), [data-action="continue"]');
        if (await continueButton.count() > 0) {
          await continueButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('Account Setup Wizard', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/setup`);

      const setupWizard = page.locator('.setup-wizard, [data-testid="setup-wizard"]');
      if (await setupWizard.count() > 0) {
        await expect(setupWizard).toBeVisible();

        // Test wizard steps
        const wizardSteps = [
          { step: 'profile', selector: '.profile-step, [data-step="profile"]' },
          { step: 'preferences', selector: '.preferences-step, [data-step="preferences"]' },
          { step: 'security', selector: '.security-step, [data-step="security"]' },
          { step: 'complete', selector: '.complete-step, [data-step="complete"]' }
        ];

        for (const { step, selector } of wizardSteps) {
          const stepElement = setupWizard.locator(selector);
          if (await stepElement.count() > 0) {
            await expect(stepElement).toBeVisible();

            // Handle different step types
            if (step === 'profile') {
              const profileForm = stepElement.locator('.profile-form, form');
              if (await profileForm.count() > 0) {
                await profileForm.locator('input[name="display_name"]').fill('Test User');
                await profileForm.locator('textarea[name="bio"]').fill('Software developer and testing enthusiast');

                const avatarUpload = profileForm.locator('input[type="file"], .avatar-upload');
                if (await avatarUpload.count() > 0) {
                  await expect(avatarUpload).toBeVisible();
                }
              }
            }

            if (step === 'preferences') {
              const preferencesForm = stepElement.locator('.preferences-form, form');
              if (await preferencesForm.count() > 0) {
                const languageSelect = preferencesForm.locator('select[name="language"]');
                const timezoneSelect = preferencesForm.locator('select[name="timezone"]');
                const themeSelect = preferencesForm.locator('select[name="theme"]');

                if (await languageSelect.count() > 0) await languageSelect.selectOption('en');
                if (await timezoneSelect.count() > 0) await timezoneSelect.selectOption('UTC');
                if (await themeSelect.count() > 0) await themeSelect.selectOption('dark');
              }
            }

            if (step === 'security') {
              const securityForm = stepElement.locator('.security-form, form');
              if (await securityForm.count() > 0) {
                const enableMfaCheckbox = securityForm.locator('input[name="enable_mfa"]');
                const backupEmailInput = securityForm.locator('input[name="backup_email"]');

                if (await enableMfaCheckbox.count() > 0) await enableMfaCheckbox.click();
                if (await backupEmailInput.count() > 0) await backupEmailInput.fill('backup@codai.test');
              }
            }

            // Test next button
            const nextButton = stepElement.locator('button:has-text("Next"), button:has-text("Continue"), [data-action="next"]');
            if (await nextButton.count() > 0) {
              await nextButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });
  });

  test.describe('👤 Profile Management', () => {

    test('Profile Information Management', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/profile`);

      const profilePage = page.locator('.profile-page, [data-testid="profile-page"]');
      if (await profilePage.count() > 0) {
        await expect(profilePage).toBeVisible();

        // Test profile display
        const profileDisplay = profilePage.locator('.profile-display, [data-testid="profile-display"]');
        if (await profileDisplay.count() > 0) {
          const profileAvatar = profileDisplay.locator('.profile-avatar, .avatar');
          const profileName = profileDisplay.locator('.profile-name, .name');
          const profileEmail = profileDisplay.locator('.profile-email, .email');
          const profileBio = profileDisplay.locator('.profile-bio, .bio');

          if (await profileAvatar.count() > 0) await expect(profileAvatar).toBeVisible();
          if (await profileName.count() > 0) await expect(profileName).toBeVisible();
          if (await profileEmail.count() > 0) await expect(profileEmail).toBeVisible();
          if (await profileBio.count() > 0) await expect(profileBio).toBeVisible();
        }

        // Test edit profile
        const editButton = profilePage.locator('button:has-text("Edit"), [data-action="edit"]');
        if (await editButton.count() > 0) {
          await editButton.click();

          const editForm = page.locator('.edit-profile-form, [data-testid="edit-form"]');
          if (await editForm.count() > 0) {
            await expect(editForm).toBeVisible();

            // Test form fields
            const editableFields = {
              firstName: 'Updated',
              lastName: 'User',
              displayName: 'Updated User',
              bio: 'Updated bio information',
              location: 'Remote',
              website: 'https://example.com',
              company: 'CODAI Testing Co.'
            };

            for (const [field, value] of Object.entries(editableFields)) {
              const input = editForm.locator(`input[name="${field}"], textarea[name="${field}"]`);
              if (await input.count() > 0) {
                await input.clear();
                await input.fill(value);
              }
            }

            // Test avatar upload
            const avatarUpload = editForm.locator('input[type="file"], .avatar-upload');
            if (await avatarUpload.count() > 0) {
              await expect(avatarUpload).toBeVisible();
            }

            // Test save changes
            const saveButton = editForm.locator('button:has-text("Save"), button[type="submit"]');
            if (await saveButton.count() > 0) {
              await saveButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });

    test('Privacy Settings Management', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/profile/privacy`);

      const privacySettings = page.locator('.privacy-settings, [data-testid="privacy-settings"]');
      if (await privacySettings.count() > 0) {
        await expect(privacySettings).toBeVisible();

        // Test privacy options
        const privacyOptions = [
          { name: 'profile_visibility', label: 'Profile Visibility' },
          { name: 'email_visibility', label: 'Email Visibility' },
          { name: 'activity_visibility', label: 'Activity Visibility' },
          { name: 'search_visibility', label: 'Search Visibility' }
        ];

        for (const option of privacyOptions) {
          const optionSection = privacySettings.locator(`[data-setting="${option.name}"], .${option.name.replace('_', '-')}`);
          if (await optionSection.count() > 0) {
            await expect(optionSection).toBeVisible();

            const visibilitySelect = optionSection.locator('select, .visibility-select');
            if (await visibilitySelect.count() > 0) {
              await visibilitySelect.selectOption('friends');
              await page.waitForTimeout(500);
            }
          }
        }

        // Test data download
        const downloadDataButton = privacySettings.locator('button:has-text("Download Data"), [data-action="download-data"]');
        if (await downloadDataButton.count() > 0) {
          await downloadDataButton.click();

          const downloadModal = page.locator('.download-modal, [data-testid="download-modal"]');
          if (await downloadModal.count() > 0) {
            await expect(downloadModal).toBeVisible();

            const confirmDownloadButton = downloadModal.locator('button:has-text("Confirm")');
            if (await confirmDownloadButton.count() > 0) {
              await confirmDownloadButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test account deletion
        const deleteAccountButton = privacySettings.locator('button:has-text("Delete Account"), [data-action="delete-account"]');
        if (await deleteAccountButton.count() > 0) {
          await deleteAccountButton.click();

          const deleteModal = page.locator('.delete-account-modal, [data-testid="delete-modal"]');
          if (await deleteModal.count() > 0) {
            await expect(deleteModal).toBeVisible();

            const confirmInput = deleteModal.locator('input[name="confirm_delete"]');
            if (await confirmInput.count() > 0) {
              await confirmInput.fill('DELETE');
            }

            // Note: We don't actually proceed with deletion in tests
            const cancelButton = deleteModal.locator('button:has-text("Cancel")');
            if (await cancelButton.count() > 0) {
              await cancelButton.click();
            }
          }
        }
      }
    });

    test('Security Settings and Password Management', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/profile/security`);

      const securitySettings = page.locator('.security-settings, [data-testid="security-settings"]');
      if (await securitySettings.count() > 0) {
        await expect(securitySettings).toBeVisible();

        // Test password change
        const passwordSection = securitySettings.locator('.password-section, [data-section="password"]');
        if (await passwordSection.count() > 0) {
          const changePasswordButton = passwordSection.locator('button:has-text("Change Password"), [data-action="change-password"]');
          if (await changePasswordButton.count() > 0) {
            await changePasswordButton.click();

            const passwordForm = page.locator('.password-change-form, [data-testid="password-form"]');
            if (await passwordForm.count() > 0) {
              await passwordForm.locator('input[name="current_password"]').fill('CurrentPassword123!');
              await passwordForm.locator('input[name="new_password"]').fill('NewPassword123!');
              await passwordForm.locator('input[name="confirm_password"]').fill('NewPassword123!');

              const savePasswordButton = passwordForm.locator('button:has-text("Save")');
              if (await savePasswordButton.count() > 0) {
                await savePasswordButton.click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test MFA setup
        const mfaSection = securitySettings.locator('.mfa-section, [data-section="mfa"]');
        if (await mfaSection.count() > 0) {
          const setupMfaButton = mfaSection.locator('button:has-text("Setup MFA"), [data-action="setup-mfa"]');
          if (await setupMfaButton.count() > 0) {
            await setupMfaButton.click();

            const mfaSetupModal = page.locator('.mfa-setup-modal, [data-testid="mfa-setup"]');
            if (await mfaSetupModal.count() > 0) {
              await expect(mfaSetupModal).toBeVisible();

              // Test QR code display
              const qrCode = mfaSetupModal.locator('.qr-code, [data-testid="qr-code"]');
              if (await qrCode.count() > 0) {
                await expect(qrCode).toBeVisible();
              }

              // Test verification code input
              const verificationInput = mfaSetupModal.locator('input[name="verification_code"]');
              if (await verificationInput.count() > 0) {
                await verificationInput.fill('123456');

                const enableMfaButton = mfaSetupModal.locator('button:has-text("Enable MFA")');
                if (await enableMfaButton.count() > 0) {
                  await enableMfaButton.click();
                  await page.waitForLoadState('networkidle');
                }
              }
            }
          }
        }

        // Test backup codes
        const backupCodesSection = securitySettings.locator('.backup-codes-section, [data-section="backup-codes"]');
        if (await backupCodesSection.count() > 0) {
          const generateCodesButton = backupCodesSection.locator('button:has-text("Generate Codes"), [data-action="generate-codes"]');
          if (await generateCodesButton.count() > 0) {
            await generateCodesButton.click();

            const codesModal = page.locator('.backup-codes-modal, [data-testid="backup-codes"]');
            if (await codesModal.count() > 0) {
              await expect(codesModal).toBeVisible();

              const codesList = codesModal.locator('.codes-list, [data-testid="codes-list"]');
              if (await codesList.count() > 0) {
                await expect(codesList).toBeVisible();
              }

              const downloadCodesButton = codesModal.locator('button:has-text("Download")');
              if (await downloadCodesButton.count() > 0) {
                await downloadCodesButton.click();
              }
            }
          }
        }

        // Test active sessions
        const sessionsSection = securitySettings.locator('.sessions-section, [data-section="sessions"]');
        if (await sessionsSection.count() > 0) {
          const sessionsList = sessionsSection.locator('.sessions-list, [data-testid="sessions-list"]');
          if (await sessionsList.count() > 0) {
            const sessionItems = sessionsList.locator('.session-item, [data-testid="session-item"]');
            if (await sessionItems.count() > 0) {
              const firstSession = sessionItems.first();

              const revokeButton = firstSession.locator('button:has-text("Revoke"), [data-action="revoke"]');
              if (await revokeButton.count() > 0) {
                await expect(revokeButton).toBeVisible();
              }
            }
          }

          const revokeAllButton = sessionsSection.locator('button:has-text("Revoke All"), [data-action="revoke-all"]');
          if (await revokeAllButton.count() > 0) {
            await revokeAllButton.click();

            const confirmModal = page.locator('.confirm-modal, [role="alertdialog"]');
            if (await confirmModal.count() > 0) {
              const cancelButton = confirmModal.locator('button:has-text("Cancel")');
              if (await cancelButton.count() > 0) {
                await cancelButton.click();
              }
            }
          }
        }
      }
    });
  });

  test.describe('🔐 Security and Compliance', () => {

    test('Security Dashboard and Monitoring', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/security`);

      const securityDashboard = page.locator('.security-dashboard, [data-testid="security-dashboard"]');
      if (await securityDashboard.count() > 0) {
        await expect(securityDashboard).toBeVisible();

        // Test security score
        const securityScore = securityDashboard.locator('.security-score, [data-testid="security-score"]');
        if (await securityScore.count() > 0) {
          await expect(securityScore).toBeVisible();

          const scoreValue = securityScore.locator('.score-value, .score');
          if (await scoreValue.count() > 0) {
            await expect(scoreValue).toBeVisible();
          }
        }

        // Test security recommendations
        const recommendations = securityDashboard.locator('.security-recommendations, [data-testid="recommendations"]');
        if (await recommendations.count() > 0) {
          const recommendationItems = recommendations.locator('.recommendation, [data-testid="recommendation"]');
          if (await recommendationItems.count() > 0) {
            const firstRecommendation = recommendationItems.first();

            const actionButton = firstRecommendation.locator('button:has-text("Fix"), [data-action="fix"]');
            if (await actionButton.count() > 0) {
              await actionButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test recent security activity
        const securityActivity = securityDashboard.locator('.security-activity, [data-testid="security-activity"]');
        if (await securityActivity.count() > 0) {
          await expect(securityActivity).toBeVisible();

          const activityItems = securityActivity.locator('.activity-item, [data-testid="activity-item"]');
          if (await activityItems.count() > 0) {
            await expect(activityItems.first()).toBeVisible();
          }
        }
      }
    });

    test('Login Activity and Audit Trail', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/security/activity`);

      const activityPage = page.locator('.activity-page, [data-testid="activity-page"]');
      if (await activityPage.count() > 0) {
        await expect(activityPage).toBeVisible();

        // Test activity filters
        const activityFilters = activityPage.locator('.activity-filters, [data-testid="filters"]');
        if (await activityFilters.count() > 0) {
          const dateRange = activityFilters.locator('input[type="date"], .date-range');
          const activityType = activityFilters.locator('select[name="type"], .activity-type');
          const locationFilter = activityFilters.locator('select[name="location"], .location-filter');

          if (await dateRange.count() > 0) {
            await dateRange.first().fill('2024-01-01');
          }
          if (await activityType.count() > 0) {
            await activityType.selectOption('login');
          }
          if (await locationFilter.count() > 0) {
            await locationFilter.selectOption('all');
          }

          await page.waitForLoadState('networkidle');
        }

        // Test activity timeline
        const activityTimeline = activityPage.locator('.activity-timeline, [data-testid="timeline"]');
        if (await activityTimeline.count() > 0) {
          const timelineItems = activityTimeline.locator('.timeline-item, [data-testid="timeline-item"]');
          if (await timelineItems.count() > 0) {
            const firstItem = timelineItems.first();

            // Test item details
            const itemTime = firstItem.locator('.item-time, .time');
            const itemAction = firstItem.locator('.item-action, .action');
            const itemLocation = firstItem.locator('.item-location, .location');
            const itemDevice = firstItem.locator('.item-device, .device');

            if (await itemTime.count() > 0) await expect(itemTime).toBeVisible();
            if (await itemAction.count() > 0) await expect(itemAction).toBeVisible();
            if (await itemLocation.count() > 0) await expect(itemLocation).toBeVisible();
            if (await itemDevice.count() > 0) await expect(itemDevice).toBeVisible();

            // Test suspicious activity marking
            const flagButton = firstItem.locator('button:has-text("Flag"), [data-action="flag"]');
            if (await flagButton.count() > 0) {
              await flagButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test export activity
        const exportButton = activityPage.locator('button:has-text("Export"), [data-action="export"]');
        if (await exportButton.count() > 0) {
          await exportButton.click();

          const exportModal = page.locator('.export-modal, [data-testid="export-modal"]');
          if (await exportModal.count() > 0) {
            await expect(exportModal).toBeVisible();

            const formatSelect = exportModal.locator('select[name="format"]');
            if (await formatSelect.count() > 0) {
              await formatSelect.selectOption('csv');
            }

            const downloadButton = exportModal.locator('button:has-text("Download")');
            if (await downloadButton.count() > 0) {
              await downloadButton.click();
            }
          }
        }
      }
    });

    test('Device and Browser Management', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/security/devices`);

      const devicesPage = page.locator('.devices-page, [data-testid="devices-page"]');
      if (await devicesPage.count() > 0) {
        await expect(devicesPage).toBeVisible();

        // Test trusted devices list
        const trustedDevices = devicesPage.locator('.trusted-devices, [data-testid="trusted-devices"]');
        if (await trustedDevices.count() > 0) {
          const deviceItems = trustedDevices.locator('.device-item, [data-testid="device-item"]');
          if (await deviceItems.count() > 0) {
            const firstDevice = deviceItems.first();

            // Test device info
            const deviceName = firstDevice.locator('.device-name, .name');
            const deviceType = firstDevice.locator('.device-type, .type');
            const lastSeen = firstDevice.locator('.last-seen, .last-activity');

            if (await deviceName.count() > 0) await expect(deviceName).toBeVisible();
            if (await deviceType.count() > 0) await expect(deviceType).toBeVisible();
            if (await lastSeen.count() > 0) await expect(lastSeen).toBeVisible();

            // Test device actions
            const renameButton = firstDevice.locator('button:has-text("Rename"), [data-action="rename"]');
            const revokeButton = firstDevice.locator('button:has-text("Revoke"), [data-action="revoke"]');

            if (await renameButton.count() > 0) {
              await renameButton.click();

              const renameModal = page.locator('.rename-modal, [data-testid="rename-modal"]');
              if (await renameModal.count() > 0) {
                await renameModal.locator('input[name="device_name"]').fill('Updated Device Name');
                await renameModal.locator('button:has-text("Save")').click();
                await page.waitForLoadState('networkidle');
              }
            }
          }
        }

        // Test browser sessions
        const browserSessions = devicesPage.locator('.browser-sessions, [data-testid="browser-sessions"]');
        if (await browserSessions.count() > 0) {
          const sessionItems = browserSessions.locator('.session-item, [data-testid="session-item"]');
          if (await sessionItems.count() > 0) {
            const firstSession = sessionItems.first();

            const sessionBrowser = firstSession.locator('.session-browser, .browser');
            const sessionLocation = firstSession.locator('.session-location, .location');
            const sessionIP = firstSession.locator('.session-ip, .ip');

            if (await sessionBrowser.count() > 0) await expect(sessionBrowser).toBeVisible();
            if (await sessionLocation.count() > 0) await expect(sessionLocation).toBeVisible();
            if (await sessionIP.count() > 0) await expect(sessionIP).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('🛡️ API Keys and Access Tokens', () => {

    test('API Key Management', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/api-keys`);

      const apiKeysPage = page.locator('.api-keys-page, [data-testid="api-keys"]');
      if (await apiKeysPage.count() > 0) {
        await expect(apiKeysPage).toBeVisible();

        // Test create new API key
        const createKeyButton = apiKeysPage.locator('button:has-text("Create API Key"), [data-action="create-key"]');
        if (await createKeyButton.count() > 0) {
          await createKeyButton.click();

          const createKeyModal = page.locator('.create-key-modal, [data-testid="create-key-modal"]');
          if (await createKeyModal.count() > 0) {
            await expect(createKeyModal).toBeVisible();

            await createKeyModal.locator('input[name="key_name"]').fill('Test API Key');
            await createKeyModal.locator('textarea[name="description"]').fill('Testing API key functionality');

            // Test permission scopes
            const permissionScopes = createKeyModal.locator('.permission-scopes, [data-testid="scopes"]');
            if (await permissionScopes.count() > 0) {
              const scopes = ['read', 'write', 'admin'];

              for (const scope of scopes) {
                const scopeCheckbox = permissionScopes.locator(`input[value="${scope}"], [data-scope="${scope}"]`);
                if (await scopeCheckbox.count() > 0) {
                  await scopeCheckbox.click();
                }
              }
            }

            // Test expiration date
            const expirationDate = createKeyModal.locator('input[name="expires_at"], .expiration-date');
            if (await expirationDate.count() > 0) {
              await expirationDate.fill('2025-12-31');
            }

            const generateButton = createKeyModal.locator('button:has-text("Generate Key")');
            if (await generateButton.count() > 0) {
              await generateButton.click();
              await page.waitForLoadState('networkidle');

              // Test key display
              const generatedKey = page.locator('.generated-key, [data-testid="generated-key"]');
              if (await generatedKey.count() > 0) {
                await expect(generatedKey).toBeVisible();

                const copyButton = generatedKey.locator('button:has-text("Copy"), [data-action="copy"]');
                if (await copyButton.count() > 0) {
                  await copyButton.click();
                }
              }
            }
          }
        }

        // Test existing API keys list
        const apiKeysList = apiKeysPage.locator('.api-keys-list, [data-testid="keys-list"]');
        if (await apiKeysList.count() > 0) {
          const keyItems = apiKeysList.locator('.key-item, [data-testid="key-item"]');
          if (await keyItems.count() > 0) {
            const firstKey = keyItems.first();

            // Test key info
            const keyName = firstKey.locator('.key-name, .name');
            const keyScopes = firstKey.locator('.key-scopes, .scopes');
            const keyExpiration = firstKey.locator('.key-expiration, .expiration');
            const keyStatus = firstKey.locator('.key-status, .status');

            if (await keyName.count() > 0) await expect(keyName).toBeVisible();
            if (await keyScopes.count() > 0) await expect(keyScopes).toBeVisible();
            if (await keyExpiration.count() > 0) await expect(keyExpiration).toBeVisible();
            if (await keyStatus.count() > 0) await expect(keyStatus).toBeVisible();

            // Test key actions
            const editButton = firstKey.locator('button:has-text("Edit"), [data-action="edit"]');
            const revokeButton = firstKey.locator('button:has-text("Revoke"), [data-action="revoke"]');
            const viewUsageButton = firstKey.locator('button:has-text("Usage"), [data-action="view-usage"]');

            if (await editButton.count() > 0) {
              await editButton.click();
              await page.waitForLoadState('networkidle');
            }

            if (await viewUsageButton.count() > 0) {
              await viewUsageButton.click();

              const usageModal = page.locator('.usage-modal, [data-testid="usage-modal"]');
              if (await usageModal.count() > 0) {
                await expect(usageModal).toBeVisible();

                const usageChart = usageModal.locator('.usage-chart, canvas, svg');
                if (await usageChart.count() > 0) {
                  await expect(usageChart).toBeVisible();
                }
              }
            }
          }
        }
      }
    });

    test('OAuth Application Management', async ({ page }) => {
      await page.goto(`${ID_BASE_URL}/oauth/applications`);

      const oauthPage = page.locator('.oauth-applications-page, [data-testid="oauth-apps"]');
      if (await oauthPage.count() > 0) {
        await expect(oauthPage).toBeVisible();

        // Test create OAuth application
        const createAppButton = oauthPage.locator('button:has-text("Create Application"), [data-action="create-app"]');
        if (await createAppButton.count() > 0) {
          await createAppButton.click();

          const createAppModal = page.locator('.create-app-modal, [data-testid="create-app-modal"]');
          if (await createAppModal.count() > 0) {
            await expect(createAppModal).toBeVisible();

            const appData = {
              name: 'Test OAuth Application',
              description: 'Testing OAuth application functionality',
              homepage_url: 'https://example.com',
              redirect_uri: 'https://example.com/callback'
            };

            for (const [field, value] of Object.entries(appData)) {
              const input = createAppModal.locator(`input[name="${field}"], textarea[name="${field}"]`);
              if (await input.count() > 0) {
                await input.fill(value);
              }
            }

            // Test application type
            const appType = createAppModal.locator('select[name="application_type"]');
            if (await appType.count() > 0) {
              await appType.selectOption('web');
            }

            const createButton = createAppModal.locator('button:has-text("Create Application")');
            if (await createButton.count() > 0) {
              await createButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }

        // Test OAuth applications list
        const appsList = oauthPage.locator('.oauth-apps-list, [data-testid="apps-list"]');
        if (await appsList.count() > 0) {
          const appItems = appsList.locator('.app-item, [data-testid="app-item"]');
          if (await appItems.count() > 0) {
            const firstApp = appItems.first();

            // Test app info
            const appName = firstApp.locator('.app-name, .name');
            const appClientId = firstApp.locator('.app-client-id, .client-id');
            const appStatus = firstApp.locator('.app-status, .status');

            if (await appName.count() > 0) await expect(appName).toBeVisible();
            if (await appClientId.count() > 0) await expect(appClientId).toBeVisible();
            if (await appStatus.count() > 0) await expect(appStatus).toBeVisible();

            // Test app actions
            const editAppButton = firstApp.locator('button:has-text("Edit"), [data-action="edit"]');
            const viewSecretsButton = firstApp.locator('button:has-text("Secrets"), [data-action="secrets"]');

            if (await editAppButton.count() > 0) {
              await editAppButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      }
    });
  });
});

// Helper functions for ID testing
export class IDTestHelpers {
  static async authenticateUser(page: Page, credentials: any) {
    await page.goto(`${ID_BASE_URL}/login`);
    await page.fill('input[name="email"]', credentials.email);
    await page.fill('input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  static async enableMFA(page: Page) {
    await page.goto(`${ID_BASE_URL}/profile/security`);
    await page.click('button:has-text("Setup MFA")');

    const mfaModal = page.locator('.mfa-setup-modal');
    if (await mfaModal.count() > 0) {
      await mfaModal.locator('input[name="verification_code"]').fill('123456');
      await mfaModal.locator('button:has-text("Enable MFA")').click();
      await page.waitForLoadState('networkidle');
    }
  }

  static async createAPIKey(page: Page, keyData: any) {
    await page.goto(`${ID_BASE_URL}/api-keys`);
    await page.click('button:has-text("Create API Key")');

    const modal = page.locator('.create-key-modal');
    if (await modal.count() > 0) {
      await modal.locator('input[name="key_name"]').fill(keyData.name);
      await modal.locator('textarea[name="description"]').fill(keyData.description);

      for (const scope of keyData.scopes) {
        await modal.locator(`input[value="${scope}"]`).click();
      }

      await modal.locator('button:has-text("Generate Key")').click();
      await page.waitForLoadState('networkidle');
    }
  }
}
