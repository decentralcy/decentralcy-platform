import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Eye, 
  Edit,
  Trash2,
  ExternalLink,
  Image,
  FileText,
  Code,
  Video,
  Globe,
  Star,
  Calendar,
  Tag,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedPortfolioBuilderProps {
  userAddress: string;
  isConnected: boolean;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: 'web3' | 'frontend' | 'backend' | 'mobile' | 'design' | 'other';
  technologies: string[];
  images: IPFSFile[];
  files: IPFSFile[];
  demoUrl?: string;
  githubUrl?: string;
  contractAddress?: string;
  featured: boolean;
  completedAt: Date;
  client?: string;
  budget?: string;
  ipfsHash: string;
  views: number;
  likes: number;
}

interface IPFSFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'code' | 'video';
  size: number;
  ipfsHash: string;
  url: string;
  uploadedAt: Date;
}

interface PortfolioStats {
  totalProjects: number;
  totalViews: number;
  totalLikes: number;
  featuredProjects: number;
  categories: { [key: string]: number };
  topTechnologies: string[];
}

export default function EnhancedPortfolioBuilder({ userAddress, isConnected }: EnhancedPortfolioBuilderProps) {
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    technologies: [] as string[],
    demoUrl: "",
    githubUrl: "",
    contractAddress: ""
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { toast } = useToast();

  // Mock portfolio projects stored on IPFS
  const mockProjects: PortfolioProject[] = [
    {
      id: "proj_1",
      title: "DeFi Lending Protocol",
      description: "A decentralized lending platform with flash loan functionality, automated liquidations, and yield farming rewards. Built with advanced security features and gas optimizations.",
      category: "web3",
      technologies: ["Solidity", "React", "TypeScript", "Hardhat", "The Graph"],
      images: [
        {
          id: "img_1",
          name: "dashboard.png",
          type: "image",
          size: 245000,
          ipfsHash: "QmX1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T",
          url: "https://ipfs.io/ipfs/QmX1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T",
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ],
      files: [
        {
          id: "file_1",
          name: "LendingProtocol.sol",
          type: "code",
          size: 15000,
          ipfsHash: "QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W",
          url: "https://ipfs.io/ipfs/QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W",
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ],
      demoUrl: "https://defi-lending-demo.vercel.app",
      githubUrl: "https://github.com/user/defi-lending",
      contractAddress: "0x1234567890123456789012345678901234567890",
      featured: true,
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      client: "DeFi Innovations Inc.",
      budget: "5.0 ETH",
      ipfsHash: "QmPortfolioProject1Hash",
      views: 1247,
      likes: 89
    },
    {
      id: "proj_2",
      title: "NFT Marketplace",
      description: "Full-featured NFT marketplace with auction functionality, royalty management, and cross-chain support. Includes creator tools and analytics dashboard.",
      category: "web3",
      technologies: ["Solidity", "Next.js", "IPFS", "Polygon", "Chainlink"],
      images: [
        {
          id: "img_2",
          name: "marketplace.png",
          type: "image",
          size: 320000,
          ipfsHash: "QmY2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U",
          url: "https://ipfs.io/ipfs/QmY2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U",
          uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ],
      files: [],
      demoUrl: "https://nft-marketplace-demo.vercel.app",
      githubUrl: "https://github.com/user/nft-marketplace",
      featured: false,
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      client: "Crypto Arts Collective",
      budget: "3.5 ETH",
      ipfsHash: "QmPortfolioProject2Hash",
      views: 892,
      likes: 67
    }
  ];

  const portfolioStats: PortfolioStats = {
    totalProjects: mockProjects.length,
    totalViews: mockProjects.reduce((sum, p) => sum + p.views, 0),
    totalLikes: mockProjects.reduce((sum, p) => sum + p.likes, 0),
    featuredProjects: mockProjects.filter(p => p.featured).length,
    categories: {
      web3: 2,
      frontend: 1,
      backend: 1
    },
    topTechnologies: ["Solidity", "React", "TypeScript", "Next.js", "IPFS"]
  };

  const uploadToIPFSMutation = useMutation({
    mutationFn: async (files: FileList) => {
      setUploadingFiles(true);
      
      // Simulate IPFS upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const uploadedFiles: IPFSFile[] = Array.from(files).map((file, index) => ({
        id: `file_${Date.now()}_${index}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.includes('text') || file.name.endsWith('.sol') ? 'code' : 'document',
        size: file.size,
        ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
        url: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`,
        uploadedAt: new Date()
      }));
      
      return uploadedFiles;
    },
    onSuccess: (files) => {
      setUploadingFiles(false);
      toast({
        title: "Files Uploaded to IPFS! 📁",
        description: `Successfully uploaded ${files.length} files to decentralized storage`,
      });
    },
    onError: () => {
      setUploadingFiles(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files to IPFS",
        variant: "destructive",
      });
    }
  });

  const saveProjectMutation = useMutation({
    mutationFn: async (project: Partial<PortfolioProject>) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would save to IPFS and update the blockchain
      const savedProject: PortfolioProject = {
        id: `proj_${Date.now()}`,
        title: project.title!,
        description: project.description!,
        category: project.category as any,
        technologies: project.technologies!,
        images: [],
        files: [],
        demoUrl: project.demoUrl,
        githubUrl: project.githubUrl,
        contractAddress: project.contractAddress,
        featured: false,
        completedAt: new Date(),
        ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
        views: 0,
        likes: 0
      };
      
      return savedProject;
    },
    onSuccess: () => {
      toast({
        title: "Project Saved! 🎉",
        description: "Your portfolio project has been saved to IPFS",
      });
      setIsEditing(false);
      setNewProject({
        title: "",
        description: "",
        category: "",
        technologies: [],
        demoUrl: "",
        githubUrl: "",
        contractAddress: ""
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadToIPFSMutation.mutate(files);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'web3':
        return 'bg-purple-100 text-purple-800';
      case 'frontend':
        return 'bg-blue-100 text-blue-800';
      case 'backend':
        return 'bg-green-100 text-green-800';
      case 'mobile':
        return 'bg-orange-100 text-orange-800';
      case 'design':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Portfolio Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{portfolioStats.totalProjects}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{portfolioStats.totalViews}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{portfolioStats.totalLikes}</div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{portfolioStats.featuredProjects}</div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="create">Add Project</TabsTrigger>
          <TabsTrigger value="settings">Portfolio Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Project Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(project.category)}>
                          {project.category}
                        </Badge>
                        {project.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Project Image */}
                  {project.images.length > 0 && (
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={project.images[0].url} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {project.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {project.likes}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {project.completedAt.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedProject(project)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Project</CardTitle>
              <CardDescription>
                Showcase your work with IPFS-stored files and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Project Title</label>
                  <Input
                    placeholder="Enter project title"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({...prev, title: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newProject.category} onValueChange={(value) => 
                    setNewProject(prev => ({...prev, category: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web3">Web3 & Blockchain</SelectItem>
                      <SelectItem value="frontend">Frontend Development</SelectItem>
                      <SelectItem value="backend">Backend Development</SelectItem>
                      <SelectItem value="mobile">Mobile Development</SelectItem>
                      <SelectItem value="design">UI/UX Design</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your project, technologies used, and challenges overcome..."
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({...prev, description: e.target.value}))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Demo URL</label>
                  <Input
                    placeholder="https://demo.example.com"
                    value={newProject.demoUrl}
                    onChange={(e) => setNewProject(prev => ({...prev, demoUrl: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">GitHub URL</label>
                  <Input
                    placeholder="https://github.com/user/repo"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject(prev => ({...prev, githubUrl: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Contract Address (if applicable)</label>
                <Input
                  placeholder="0x..."
                  value={newProject.contractAddress}
                  onChange={(e) => setNewProject(prev => ({...prev, contractAddress: e.target.value}))}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Project Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload images, code files, documentation, or videos to IPFS
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.sol,.js,.ts,.py,.md,.pdf"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploadingFiles}
                  >
                    {uploadingFiles ? "Uploading to IPFS..." : "Choose Files"}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={() => saveProjectMutation.mutate(newProject)}
                disabled={!newProject.title || !newProject.description || saveProjectMutation.isPending}
                className="w-full"
              >
                {saveProjectMutation.isPending ? "Saving to IPFS..." : "Save Project"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Portfolio Title</label>
                <Input placeholder="Your Professional Portfolio" />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea placeholder="Tell employers about your expertise and experience..." />
              </div>
              <div>
                <label className="text-sm font-medium">Portfolio Visibility</label>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="verified">Verified Users Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProject.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(selectedProject.category)}>
                      {selectedProject.category}
                    </Badge>
                    {selectedProject.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>{selectedProject.description}</p>
              
              {/* Technologies */}
              <div>
                <h4 className="font-medium mb-2">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-4">
                {selectedProject.demoUrl && (
                  <Button variant="outline" onClick={() => window.open(selectedProject.demoUrl, '_blank')}>
                    <Globe className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                )}
                {selectedProject.githubUrl && (
                  <Button variant="outline" onClick={() => window.open(selectedProject.githubUrl, '_blank')}>
                    <Code className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                )}
              </div>

              {/* IPFS Files */}
              {selectedProject.files.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Project Files (IPFS)</h4>
                  <div className="space-y-2">
                    {selectedProject.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB • {file.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* IPFS Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
              Decentralized Portfolio Storage
            </h3>
            <p className="text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
              Your portfolio is stored on IPFS, ensuring it's permanently accessible and truly yours. 
              No central authority can remove your work history, and clients can verify authenticity 
              through immutable blockchain records.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-blue-600 text-white">Permanent Storage</Badge>
              <Badge className="bg-purple-600 text-white">Decentralized Access</Badge>
              <Badge className="bg-green-600 text-white">Tamper Proof</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}