<?php

namespace App\Services\Table;

class TableService
{
    /**
     * Data for table rows
     *
     * @var array
     */
    public array $rows = [];

    /**
     * Data for table heading
     *
     * @var array
     */
    public array $heading = [];

    /**
     * Whether or not to automatically create the table header
     *
     * @var bool
     */
    public bool $auto_heading = true;

    /**
     * Table caption
     *
     * @var string|null
     */
    public ?string $caption = null;

    /**
     * Table layout template
     *
     * @var array|null
     */
    public ?array $template = null;

    /**
     * Newline setting
     *
     * @var string
     */
    public string $newline = "\n";

    /**
     * Contents of empty cells
     *
     * @var string
     */
    public string $empty_cells = '';

    /**
     * Callback for custom table layout
     *
     * @var callable|null
     */
    public $function = null;

    public ?array $temp = null;

    /**
     * Set the template from the table config file if it exists
     *
     * @param array $config
     */
    public function __construct(array $config = [])
    {
        // initialize config
        foreach ($config as $key => $val) {
            $this->template[$key] = $val;
        }
    }

    /**
     * Set the template
     *
     * @param array $template
     * @return bool
     */
    public function setTemplate(array $template): bool
    {
        $this->template = $template;
        return true;
    }

    /**
     * Set the table heading
     *
     * Can be passed as an array or discreet params
     *
     * @param mixed ...$args
     * @return TableService
     */
    public function setHeading(...$args): TableService
    {
        $this->heading = $this->prepArgs($args);
        return $this;
    }

    /**
     * Set columns. Takes a one-dimensional array as input and creates
     * a multi-dimensional array with a depth equal to the number of
     * columns. This allows a single array with many elements to be
     * displayed in a table that has a fixed column count.
     *
     * @param array $array
     * @param int $colLimit
     * @return array|false
     */
    public function makeColumns(array $array = [], int $colLimit = 0)
    {
        if (empty($array) || !is_int($colLimit)) {
            return false;
        }

        // Turn off the auto-heading feature since it's doubtful we
        // will want headings from a one-dimensional array
        $this->auto_heading = false;

        if ($colLimit === 0) {
            return $array;
        }

        $new = [];
        do {
            $temp = array_splice($array, 0, $colLimit);

            if (count($temp) < $colLimit) {
                for ($i = count($temp); $i < $colLimit; $i++) {
                    $temp[] = '&nbsp;';
                }
            }

            $new[] = $temp;
        } while (count($array) > 0);

        return $new;
    }

    /**
     * Set "empty" cells
     *
     * Can be passed as an array or discreet params
     *
     * @param mixed $value
     * @return TableService
     */
    public function setEmpty($value): TableService
    {
        $this->empty_cells = $value;
        return $this;
    }

    /**
     * Add a table row
     *
     * Can be passed as an array or discreet params
     *
     * @param mixed ...$args
     * @return TableService
     */
    public function addRow(...$args): TableService
    {
        $this->rows[] = $this->prepArgs($args);
        return $this;
    }

    /**
     * Prep Args
     *
     * Ensures a standard associative array format for all cell data
     *
     * @param array $args
     * @return array
     */
    protected function prepArgs(array $args): array
    {
        // If there is no $args[0], skip this and treat as an associative array
        // This can happen if there is only a single key, for example this is passed to table->generate
        // array(array('foo'=>'bar'))
        if (isset($args[0]) && count($args) === 1 && is_array($args[0]) && !isset($args[0]['data'])) {
            $args = $args[0];
        }

        foreach ($args as $key => $val) {
            if (!is_array($val)) {
                $args[$key] = ['data' => $val];
            }
        }

        return $args;
    }

    /**
     * Add a table caption
     *
     * @param string $caption
     * @return TableService
     */
    public function setCaption(string $caption): TableService
    {
        $this->caption = $caption;
        return $this;
    }

    /**
     * Generate the table
     *
     * @param mixed $tableData
     * @return string
     */
    public function generate($tableData = null): string
    {
        // The table data can optionally be passed to this function
        // either as a database result object or an array
        if (!empty($tableData)) {
            if (is_array($tableData)) {
                $this->setFromArray($tableData);
            }
        }

        // Is there anything to display? No? Smite them!
        if (empty($this->heading) && empty($this->rows)) {
            return 'Undefined table data';
        }

        // Compile and validate the template date
        $this->compileTemplate();

        // Validate a possibly existing custom cell manipulation function
        if (isset($this->function) && !is_callable($this->function)) {
            $this->function = null;
        }

        // Build the table!

        $out = $this->template['table_open'] . $this->newline;

        // Add any caption here
        if ($this->caption) {
            $out .= '<caption>' . $this->caption . '</caption>' . $this->newline;
        }

        // Is there a table heading to display?
        if (!empty($this->heading)) {
            $out .= $this->template['thead_open'] . $this->newline . $this->template['heading_row_start'] . $this->newline;

            foreach ($this->heading as $heading) {
                $temp = $this->template['heading_cell_start'];

                foreach ($heading as $key => $val) {
                    if ($key !== 'data') {
                        $temp = str_replace('<th', '<th ' . $key . '="' . $val . '"', $temp);
                    }
                }

                $out .= $temp . ($heading['data'] ?? '') . $this->template['heading_cell_end'];
            }

            $out .= $this->template['heading_row_end'] . $this->newline . $this->template['thead_close'] . $this->newline;
        }

        // Build the table rows
        if (!empty($this->rows)) {
            $out .= $this->template['tbody_open'] . $this->newline;

            $i = 1;
            foreach ($this->rows as $row) {
                if (!is_array($row)) {
                    break;
                }

                // We use modulus to alternate the row colors
                $name = fmod($i++, 2) ? '' : 'alt_';

                $out .= $this->template['row_' . $name . 'start'] . $this->newline;

                foreach ($row as $cell) {
                    $temp = $this->template['cell_' . $name . 'start'];

                    foreach ($cell as $key => $val) {
                        if ($key !== 'data') {
                            $temp = str_replace('<td', '<td ' . $key . '="' . $val . '"', $temp);
                        }
                    }

                    $cell = $cell['data'] ?? '';
                    $out .= $temp;

                    if ($cell === '' || $cell === null) {
                        $out .= $this->empty_cells;
                    } elseif (isset($this->function)) {
                        if ($this->function !== null) {
                            $out .= call_user_func($this->function, $cell);
                        }
                    } else {
                        $out .= $cell;
                    }

                    $out .= $this->template['cell_' . $name . 'end'];
                }

                $out .= $this->template['row_' . $name . 'end'] . $this->newline;
            }

            $out .= $this->template['tbody_close'] . $this->newline;
        }

        $out .= $this->template['table_close'];

        // Clear table class properties before generating the table
        $this->clear();

        return $out;
    }

    /**
     * Clears the table arrays.  Useful if multiple tables are being generated
     *
     * @return TableService
     */
    public function clear(): TableService
    {
        $this->rows = [];
        $this->heading = [];
        $this->auto_heading = true;
        $this->caption = null;
        return $this;
    }

    /**
     * Set table data from a database result object
     *
     * @param object $object Database result object
     * @return void
     */
    protected function setFromDbResult($object): void
    {
        // First generate the headings from the table column names
        if ($this->auto_heading && empty($this->heading)) {
            $this->heading = $this->prepArgs($object->list_fields());
        }

        foreach ($object->result_array() as $row) {
            $this->rows[] = $this->prepArgs($row);
        }
    }

    /**
     * Set table data from an array
     *
     * @param array $data
     * @return void
     */
    protected function setFromArray(array $data): void
    {
        if ($this->auto_heading && empty($this->heading)) {
            $this->heading = $this->prepArgs(array_shift($data));
        }

        foreach ($data as &$row) {
            $this->rows[] = $this->prepArgs($row);
        }
    }

    /**
     * Compile Template
     *
     * @return void
     */
    protected function compileTemplate(): void
    {
        if ($this->template === null) {
            $this->template = $this->defaultTemplate();
            return;
        }

        $this->temp = $this->defaultTemplate();
        foreach (['table_open', 'thead_open', 'thead_close', 'heading_row_start', 'heading_row_end', 'heading_cell_start', 'heading_cell_end', 'tbody_open', 'tbody_close', 'row_start', 'row_end', 'cell_start', 'cell_end', 'row_alt_start', 'row_alt_end', 'cell_alt_start', 'cell_alt_end', 'table_close'] as $val) {
            if (!isset($this->template[$val])) {
                $this->template[$val] = $this->temp[$val];
            }
        }
    }

    /**
     * Default Template
     *
     * @return array
     */
    protected function defaultTemplate(): array
    {
        return [
            'table_open' => '<table border="0" cellpadding="4" cellspacing="0">',
            'thead_open' => '<thead>',
            'thead_close' => '</thead>',
            'heading_row_start' => '<tr>',
            'heading_row_end' => '</tr>',
            'heading_cell_start' => '<th>',
            'heading_cell_end' => '</th>',
            'tbody_open' => '<tbody>',
            'tbody_close' => '</tbody>',
            'row_start' => '<tr>',
            'row_end' => '</tr>',
            'cell_start' => '<td>',
            'cell_end' => '</td>',
            'row_alt_start' => '<tr>',
            'row_alt_end' => '</tr>',
            'cell_alt_start' => '<td>',
            'cell_alt_end' => '</td>',
            'table_close' => '</table>'
        ];
    }

    /**
     * Bootstrap template for general use
     *
     * @return array
     */
    public static function bootstrapTemplate(): array
    {
        return [
            'table_open' => '<table border="0" cellpadding="0" cellspacing="0" class="table table-bordered">',
            'thead_open' => '<thead class="thead-light">',
            'thead_close' => '</thead>',
            'heading_row_start' => '<tr>',
            'heading_row_end' => '</tr>',
            'heading_cell_start' => '<th>',
            'heading_cell_end' => '</th>',
            'tbody_open' => '<tbody class="list">',
            'tbody_close' => '</tbody>',
            'row_start' => '<tr>',
            'row_end' => '</tr>',
            'cell_start' => '<td>',
            'cell_end' => '</td>',
            'row_alt_start' => '<tr>',
            'row_alt_end' => '</tr>',
            'cell_alt_start' => '<td>',
            'cell_alt_end' => '</td>',
            'table_close' => '</table>'
        ];
    }

    /**
     * Bootstrap striped template
     *
     * @return array
     */
    public static function bootstrapStripedTemplate(): array
    {
        return [
            'table_open' => '<table border="0" cellpadding="0" cellspacing="0" class="table table-bordered table-striped">',
            'thead_open' => '<thead class="thead-dark">',
            'thead_close' => '</thead>',
            'heading_row_start' => '<tr>',
            'heading_row_end' => '</tr>',
            'heading_cell_start' => '<th>',
            'heading_cell_end' => '</th>',
            'tbody_open' => '<tbody>',
            'tbody_close' => '</tbody>',
            'row_start' => '<tr>',
            'row_end' => '</tr>',
            'cell_start' => '<td>',
            'cell_end' => '</td>',
            'row_alt_start' => '<tr>',
            'row_alt_end' => '</tr>',
            'cell_alt_start' => '<td>',
            'cell_alt_end' => '</td>',
            'table_close' => '</table>'
        ];
    }

    /**
     * Bootstrap responsive template
     *
     * @return array
     */
    public static function bootstrapResponsiveTemplate(): array
    {
        return [
            'table_open' => '<table border="0" cellpadding="0" cellspacing="0" class="table table-bordered table-responsive">',
            'thead_open' => '<thead class="thead-primary">',
            'thead_close' => '</thead>',
            'heading_row_start' => '<tr>',
            'heading_row_end' => '</tr>',
            'heading_cell_start' => '<th>',
            'heading_cell_end' => '</th>',
            'tbody_open' => '<tbody>',
            'tbody_close' => '</tbody>',
            'row_start' => '<tr>',
            'row_end' => '</tr>',
            'cell_start' => '<td>',
            'cell_end' => '</td>',
            'row_alt_start' => '<tr>',
            'row_alt_end' => '</tr>',
            'cell_alt_start' => '<td>',
            'cell_alt_end' => '</td>',
            'table_close' => '</table>'
        ];
    }

    /**
     * Create table from Laravel Collection
     *
     * @param \Illuminate\Support\Collection $collection
     * @param array $heading
     * @param array $template
     * @return string
     */
    public function fromCollection($collection, array $heading = [], array $template = []): string
    {
        if ($collection->isEmpty()) {
            return '<p>No data available</p>';
        }

        // Set template if provided
        if (!empty($template)) {
            $this->setTemplate($template);
        }

        // Set heading if provided
        if (!empty($heading)) {
            $this->setHeading($heading);
        }

        // Add rows from collection
        foreach ($collection as $item) {
            $this->addRow($item->toArray());
        }

        return $this->generate();
    }

    /**
     * Create table from array data
     *
     * @param array $data
     * @param array $heading
     * @param array $template
     * @return string
     */
    public function fromArray(array $data, array $heading = [], array $template = []): string
    {
        if (empty($data)) {
            return '<p>No data available</p>';
        }

        // Set template if provided
        if (!empty($template)) {
            $this->setTemplate($template);
        }

        // Set heading if provided
        if (!empty($heading)) {
            $this->setHeading($heading);
        }

        return $this->generate($data);
    }

    /**
     * Create table from Eloquent query results
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $heading
     * @param array $template
     * @return string
     */
    public function fromQuery($query, array $heading = [], array $template = []): string
    {
        $results = $query->get();

        if ($results->isEmpty()) {
            return '<p>No data available</p>';
        }

        // Set template if provided
        if (!empty($template)) {
            $this->setTemplate($template);
        }

        // Set heading if provided
        if (!empty($heading)) {
            $this->setHeading($heading);
        }

        // Add rows from query results
        foreach ($results as $item) {
            $this->addRow($item->toArray());
        }

        return $this->generate();
    }

    /**
     * Add custom cell formatting function
     *
     * @param callable $function
     * @return TableService
     */
    public function setCellFunction(callable $function): TableService
    {
        $this->function = $function;
        return $this;
    }

    /**
     * Generate table with sorting capabilities
     *
     * @param array $data
     * @param string $sortBy
     * @param string $direction
     * @return string
     */
    public function generateWithSorting(array $data, string $sortBy = '', string $direction = 'asc'): string
    {
        if (!empty($sortBy) && !empty($data)) {
            usort($data, function ($a, $b) use ($sortBy, $direction) {
                $aValue = $a[$sortBy] ?? '';
                $bValue = $b[$sortBy] ?? '';
                
                if ($direction === 'desc') {
                    return $bValue <=> $aValue;
                }
                
                return $aValue <=> $bValue;
            });
        }

        return $this->generate($data);
    }

    /**
     * Generate table with pagination info
     *
     * @param array $data
     * @param int $total
     * @param int $perPage
     * @param int $currentPage
     * @return array
     */
    public function generateWithPagination(array $data, int $total, int $perPage, int $currentPage): array
    {
        $tableHtml = $this->generate($data);
        
        $paginationInfo = [
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $currentPage,
            'last_page' => ceil($total / $perPage),
            'from' => (($currentPage - 1) * $perPage) + 1,
            'to' => min($currentPage * $perPage, $total)
        ];

        return [
            'table' => $tableHtml,
            'pagination' => $paginationInfo
        ];
    }

    /**
     * Export table to CSV format
     *
     * @param array $data
     * @param string $filename
     * @return string
     */
    public function exportToCsv(array $data, string $filename = 'table_export.csv'): string
    {
        $csv = '';
        
        // Add heading if exists
        if (!empty($this->heading)) {
            $headingData = [];
            foreach ($this->heading as $head) {
                $headingData[] = $head['data'] ?? '';
            }
            $csv .= implode(',', $headingData) . "\n";
        }
        
        // Add data rows
        foreach ($data as $row) {
            $rowData = [];
            foreach ($row as $cell) {
                $cellData = $cell['data'] ?? $cell;
                // Escape commas and quotes in CSV
                $cellData = str_replace('"', '""', $cellData);
                if (strpos($cellData, ',') !== false || strpos($cellData, '"') !== false) {
                    $cellData = '"' . $cellData . '"';
                }
                $rowData[] = $cellData;
            }
            $csv .= implode(',', $rowData) . "\n";
        }
        
        return $csv;
    }

    /**
     * Get table statistics
     *
     * @param array $data
     * @return array
     */
    public function getStatistics(array $data): array
    {
        return [
            'total_rows' => count($data),
            'total_columns' => !empty($data) ? count($data[0]) : 0,
            'has_heading' => !empty($this->heading),
            'has_caption' => !empty($this->caption),
            'has_template' => !empty($this->template),
            'has_function' => !empty($this->function)
        ];
    }
}
