"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { QRCodeSVG } from "qrcode.react"
import { Facebook, Twitter, LinkedinIcon as LinkedIn, Instagram, Github, Mail, Phone, Globe, Upload, Plus, Paperclip, Video } from 'lucide-react'
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SocialLink {
  platform: string
  url: string
}

interface Attachment {
  name: string
  type: string
  url: string
}

interface ProfileData {
  name: string
  profession: string
  company: string
  email: string
  phone: string
  website: string
  bio: string
  socialLinks: SocialLink[]
  attachments: Attachment[]
}

const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: LinkedIn },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "github", label: "GitHub", icon: Github },
  // Add more platforms as needed
]

export default function ProfilePage() {
  const { toast } = useToast()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    profession: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    bio: "",
    socialLinks: [],
    attachments: []
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  })

  const onAttachmentDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          attachments: [
            ...prev.attachments,
            {
              name: file.name,
              type: file.type,
              url: e.target?.result as string
            }
          ]
        }))
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const { getRootProps: getAttachmentRootProps, getInputProps: getAttachmentInputProps } = useDropzone({
    onDrop: onAttachmentDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    }
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof ProfileData
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    setProfileData(prev => {
      const newSocialLinks = [...prev.socialLinks]
      newSocialLinks[index] = { ...newSocialLinks[index], [field]: value }
      return { ...prev, socialLinks: newSocialLinks }
    })
  }

  const addSocialLink = () => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }))
  }

  const removeSocialLink = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }))
  }

  const removeAttachment = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    // Here you would typically send the data to your backend
    console.log({ avatar, ...profileData })
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${profileData.name.toLowerCase().replace(/\s+/g, '-')}`

  const generateVCard = () => {
    let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
    vcard += `FN:${profileData.name}\n`;
    vcard += `TITLE:${profileData.profession}\n`;
    vcard += `ORG:${profileData.company}\n`;
    vcard += `EMAIL:${profileData.email}\n`;
    vcard += `TEL:${profileData.phone}\n`;
    vcard += `URL:${profileData.website}\n`;
    vcard += `NOTE:${profileData.bio}\n`;
    profileData.socialLinks.forEach(link => {
      vcard += `X-SOCIALPROFILE;TYPE=${link.platform}:${link.url}\n`;
    });
    vcard += "END:VCARD";

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${profileData.name}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <Tabs defaultValue="edit">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information, social media links, and attachments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-primary">
                    {avatar ? (
                      <div className="relative w-32 h-32">
                        <Image
                          src={avatar}
                          alt="Profile"
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          {isDragActive ? "Drop your image here" : "Drag & drop or click to upload"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={profileData.profession}
                    onChange={(e) => handleInputChange(e, 'profession')}
                    placeholder="Software Developer"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => handleInputChange(e, 'company')}
                    placeholder="Tech Corp"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange(e, 'bio')}
                    placeholder="Tell us about yourself"
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange(e, 'email')}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange(e, 'phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange(e, 'website')}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Social Media Links</h3>
                  {profileData.socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        value={link.platform}
                        onValueChange={(value) => handleSocialLinkChange(index, 'platform', value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {socialPlatforms.map((platform) => (
                            <SelectItem key={platform.value} value={platform.value}>
                              <div className="flex items-center">
                                <platform.icon className="w-4 h-4 mr-2" />
                                {platform.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                        placeholder="Profile URL"
                      />
                      <Button variant="destructive" size="icon" onClick={() => removeSocialLink(index)}>
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addSocialLink} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Social Link
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attachments</h3>
                  <div {...getAttachmentRootProps()} className="cursor-pointer">
                    <input {...getAttachmentInputProps()} />
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-primary">
                      <div className="text-center">
                        <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Drag & drop or click to upload files
                        </p>
                      </div>
                    </div>
                  </div>
                  {profileData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center">
                        {attachment.type.startsWith('image/') ? (
                          <Image src={attachment.url} alt={attachment.name} width={40} height={40} className="object-cover rounded" />
                        ) : attachment.type.startsWith('video/') ? (
                          <Video className="w-10 h-10 text-blue-500" />
                        ) : (
                          
<Paperclip className="w-10 h-10 text-gray-500" />
                        )}
                        <span className="ml-2">{attachment.name}</span>
                      </div>
                      <Button variant="destructive" size="icon" onClick={() => removeAttachment(index)}>
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>This is how your profile will appear to others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {avatar && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={avatar}
                      alt="Profile Preview"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{profileData.name || "Your Name"}</h2>
                  <p className="text-lg text-muted-foreground">{profileData.profession || "Your Profession"}</p>
                  <p className="text-sm">{profileData.company || "Your Company"}</p>
                </div>

                <div className="w-full max-w-md space-y-2">
                  {profileData.bio && (
                    <p className="text-sm text-center">{profileData.bio}</p>
                  )}

                  <div className="flex flex-col space-y-2">
                    {profileData.email && (
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${profileData.email}`} className="text-sm hover:underline">
                          {profileData.email}
                        </a>
                      </div>
                    )}

                    {profileData.phone && (
                      <div className="flex items-center justify-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${profileData.phone}`} className="text-sm hover:underline">
                          {profileData.phone}
                        </a>
                      </div>
                    )}

                    {profileData.website && (
                      <div className="flex items-center justify-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                          {profileData.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4 pt-4">
                    {profileData.socialLinks.map((link, index) => {
                      const platform = socialPlatforms.find(p => p.value === link.platform)
                      if (platform) {
                        const Icon = platform.icon
                        return (
                          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                            <Icon className="w-5 h-5" />
                          </a>
                        )
                      }
                      return null
                    })}
                  </div>

                  {profileData.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {profileData.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            download={attachment.name}
                            className="flex items-center p-2 border rounded hover:bg-gray-100"
                          >
                            {attachment.type.startsWith('image/') ? (
                              <Image src={attachment.url} alt={attachment.name} width={40} height={40} className="object-cover rounded" />
                            ) : attachment.type.startsWith('video/') ? (
                              <Video className="w-10 h-10 text-blue-500" />
                            ) : (
                              <Paperclip className="w-10 h-10 text-gray-500" />
                            )}
                            <span className="ml-2 text-sm truncate">{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Share Profile</CardTitle>
              <CardDescription>Share your profile using QR code or link</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <QRCodeSVG value={profileUrl} size={200} />
              <Input value={profileUrl} readOnly />
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(profileUrl)
                    toast({
                      title: "Link Copied",
                      description: "Profile link has been copied to clipboard.",
                    })
                  }}
                  variant="secondary"
                >
                  Copy Link
                </Button>
                <Button onClick={generateVCard} variant="outline">
                  Add to Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

