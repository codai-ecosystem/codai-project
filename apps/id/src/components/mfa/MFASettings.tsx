'use client'

import React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface MFADevice {
  id: string;
  type: 'TOTP' | 'SMS' | 'EMAIL' | 'HARDWARE_TOKEN' | 'BACKUP_CODES';
  name: string;
  isActive: boolean;
  isVerified: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

interface TOTPSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export function MFASettings() {
  const [devices, setDevices] = useState<MFADevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<TOTPSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMFADevices();
  }, []);

  const fetchMFADevices = async () => {
    try {
      const response = await fetch('/api/auth/mfa/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch MFA devices',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupTOTP = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/mfa/setup/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName: 'Authenticator App' })
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data);
        toast({
          title: 'TOTP Setup Started',
          description: 'Scan the QR code with your authenticator app'
        });
      } else {
        throw new Error('Failed to setup TOTP');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup TOTP authenticator',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch('/api/auth/mfa/verify/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationCode,
          deviceName: 'Authenticator App'
        })
      });

      if (response.ok) {
        toast({
          title: 'TOTP Verified',
          description: 'Your authenticator app has been successfully configured'
        });
        setSetupData(null);
        setVerificationCode('');
        fetchMFADevices();
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const setupSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter your phone number',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/mfa/setup/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, deviceName: 'SMS Authentication' })
      });

      if (response.ok) {
        toast({
          title: 'SMS Setup',
          description: 'Verification code sent to your phone'
        });
      } else {
        throw new Error('Failed to setup SMS MFA');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup SMS authentication',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/mfa/devices/${deviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Device Removed',
          description: 'MFA device has been removed from your account'
        });
        fetchMFADevices();
      } else {
        throw new Error('Failed to remove device');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove MFA device',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: 'Copied',
        description: 'Code copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const generateQRCode = async (data: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(data);
      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return null;
    }
  };

  if (loading && !setupData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MFA settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Multi-Factor Authentication
        </h1>
        <p className="text-gray-600 mt-2">
          Secure your account with additional authentication methods
        </p>
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devices">My Devices</TabsTrigger>
          <TabsTrigger value="setup">Add New Device</TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Active MFA Devices</CardTitle>
              <CardDescription>
                Manage your multi-factor authentication devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No MFA devices configured. Add a device to secure your account.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          {device.type === 'TOTP' && <Smartphone className="h-4 w-4 text-blue-600" />}
                          {device.type === 'SMS' && <Smartphone className="h-4 w-4 text-green-600" />}
                          {device.type === 'HARDWARE_TOKEN' && <Key className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={device.isVerified ? 'default' : 'secondary'}>
                              {device.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                            <Badge variant={device.isActive ? 'default' : 'outline'}>
                              {device.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDevice(device.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          {!setupData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Authenticator App
                  </CardTitle>
                  <CardDescription>
                    Use apps like Google Authenticator, Authy, or 1Password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={setupTOTP} disabled={loading} className="w-full">
                    Setup Authenticator App
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    SMS Authentication
                  </CardTitle>
                  <CardDescription>
                    Receive verification codes via text message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <Button onClick={setupSMS} disabled={loading} className="w-full">
                    Setup SMS Authentication
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Complete TOTP Setup</CardTitle>
                <CardDescription>
                  Scan the QR code and enter the verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="font-medium mb-3">1. Scan QR Code</h3>
                    <div className="border rounded-lg p-4 bg-white">
                      <img
                        src={`data:image/png;base64,${btoa(setupData.qrCodeUrl)}`}
                        alt="TOTP QR Code"
                        className="mx-auto"
                        style={{ maxWidth: '200px' }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Or manually enter: <code className="bg-gray-100 px-2 py-1 rounded">
                        {setupData.manualEntryKey}
                      </code>
                    </p>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium mb-3">2. Enter Verification Code</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="verification">6-digit code</Label>
                        <Input
                          id="verification"
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <Button
                        onClick={verifyTOTP}
                        disabled={isVerifying || verificationCode.length !== 6}
                        className="w-full"
                      >
                        {isVerifying ? 'Verifying...' : 'Verify & Complete Setup'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Backup Codes:</strong> Save these codes in a secure location.
                    You can use them to access your account if you lose your authenticator device.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2">
                  {setupData.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded font-mono text-sm"
                    >
                      <span>{code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code)}
                      >
                        {copiedCode === code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

