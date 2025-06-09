import { useCategories } from "@/lib/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  onReset: () => void;
}

export function Sidebar({ selectedCategories, onChange, onReset }: SidebarProps) {
  const { categories, loading, error } = useCategories();

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onChange(newSelection);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">Failed to load categories</div>
        ) : loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-muted-foreground">No categories available</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <Button variant="outline" size="sm" className="w-full" onClick={onReset}>
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
