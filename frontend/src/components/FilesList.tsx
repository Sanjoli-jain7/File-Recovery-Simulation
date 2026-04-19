import { File, Image, Video, FileText, Wrench, Type, Settings } from 'lucide-react';

interface FilesListProps {
  files: string[];
}

interface CategorizedFiles {
  images: string[];
  documents: string[];
  videos: string[];
  programs: string[];
  fonts: string[];
  system_files: string[];
  other: string[];
}

const categorizeFiles = (files: string[]): CategorizedFiles => {
  const categorized: CategorizedFiles = {
    images: [],
    documents: [],
    videos: [],
    programs: [],
    fonts: [],
    system_files: [],
    other: [],
  };

  files.forEach((file) => {
    const fileName = file.toLowerCase();

    if (fileName.includes('\\images\\') || fileName.includes('/images/')) {
      categorized.images.push(file);
    } else if (fileName.includes('\\documents\\') || fileName.includes('/documents/')) {
      categorized.documents.push(file);
    } else if (fileName.includes('\\videos\\') || fileName.includes('/videos/')) {
      categorized.videos.push(file);
    } else if (fileName.includes('\\programs\\') || fileName.includes('/programs/')) {
      categorized.programs.push(file);
    } else if (fileName.includes('\\fonts\\') || fileName.includes('/fonts/')) {
      categorized.fonts.push(file);
    } else if (fileName.includes('\\system_files\\') || fileName.includes('/system_files/')) {
      categorized.system_files.push(file);
    } else {
      categorized.other.push(file);
    }
  });

  return categorized;
};

const CategorySection = ({
  title,
  files,
  icon: Icon,
  color
}: {
  title: string;
  files: string[];
  icon: any;
  color: string;
}) => {
  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className={`${color} px-4 py-3 flex items-center gap-2 text-white`}>
        <Icon className="w-5 h-5" />
        <h3 className="font-semibold">{title}</h3>
        <span className="ml-auto bg-white/20 px-2 py-1 rounded text-sm">
          {files.length}
        </span>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="space-y-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="text-sm text-gray-700 py-1 px-2 hover:bg-gray-50 rounded truncate"
              title={file}
            >
              {file.split('\\').pop() || file.split('/').pop()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function FilesList({ files }: FilesListProps) {
  const categorized = categorizeFiles(files);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Recovered Files
        </h2>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{files.length}</span> files
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategorySection
          title="Images"
          files={categorized.images}
          icon={Image}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
        />
        <CategorySection
          title="Documents"
          files={categorized.documents}
          icon={FileText}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
        />
        <CategorySection
          title="Videos"
          files={categorized.videos}
          icon={Video}
          color="bg-gradient-to-r from-red-500 to-orange-500"
        />
        <CategorySection
          title="Programs"
          files={categorized.programs}
          icon={Wrench}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
        />
        <CategorySection
          title="Fonts"
          files={categorized.fonts}
          icon={Type}
          color="bg-gradient-to-r from-amber-500 to-yellow-500"
        />
        <CategorySection
          title="System Files"
          files={categorized.system_files}
          icon={Settings}
          color="bg-gradient-to-r from-gray-600 to-gray-700"
        />
        {categorized.other.length > 0 && (
          <CategorySection
            title="Other Files"
            files={categorized.other}
            icon={File}
            color="bg-gradient-to-r from-slate-500 to-slate-600"
          />
        )}
      </div>
    </div>
  );
}
