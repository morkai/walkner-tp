<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

class PagedData implements IteratorAggregate
{
	private $page = 1;

	private $perPage = 10;

	private $pageCount = 0;

	private $items = array();

	public function __construct($page, $perPage = 10)
	{
		$this->page    = $page < 1 ? 1 : (int)$page;
		$this->perPage = (int)$perPage;
	}

	public function isEmpty()
	{
		return empty($this->items);
	}

	public function getIterator()
	{
		return new ArrayIterator($this->items);
	}

	public function getPage()
	{
		return $this->page;
	}

	public function getOffset()
	{
		return ($this->page - 1) * $this->perPage;
	}

	public function getPerPage()
	{
		return $this->perPage;
	}

	public function getPageCount()
	{
		return $this->pageCount;
	}

	public function fill($totalItems, $items)
	{
		$this->pageCount = ceil($totalItems / $this->perPage);
		$this->items = $items;
	}

	public function isLinkToFirstPageAvailable()
	{
		return $this->page > 2;
	}

	public function isLinkToPreviousPageAvailable()
	{
		return $this->page > 1;
	}

	public function isLinkToNextPageAvailable()
	{
		return $this->page < $this->pageCount;
	}

	public function isLinkToLastPageAvailable()
	{
		return $this->page < ($this->pageCount - 1);
	}

	public function render($href, $param = 'page')
	{
		if ($this->getPageCount() < 2)
		{
			return '';
		}


    $result = '<div class="pagination-centered"><ul class="pagination pagination-lg">';
		$result .= '<li class="' . ($this->isLinkToFirstPageAvailable() ? '' : 'disabled') . '"><a href="' . $href . '&amp;' . $param . '=1">&laquo;</a>';
		$result .= '<li class="' . ($this->isLinkToPreviousPageAvailable() ? '' : 'disabled') . '"><a href="' . $href . '&amp;' . $param . '=' . ($this->getPage() - 1) . '">&lsaquo;</a>';

    $pageNumbers = 3;

		$page = $this->getPage();
		$last = $page + $pageNumbers;
		$cut  = true;

		if (($page - $pageNumbers) < 1)
		{
			$page = 1;
		}
		else
		{
			$page -= $pageNumbers;

      if ($page !== 1)
      {
        $result .= '<li class="disabled"><a href="#">...</a>';
      }
		}

		if ($last > $this->getPageCount())
		{
			$last = $this->getPageCount();
			$cut = false;
		}

		for (; $page <= $last; ++$page)
		{
			$result .= '<li class="' . ($page === $this->getPage() ? 'active' : '') . '"><a href="' . $href . '&amp;' . $param . '=' . $page . '">' . $page . '</a>';
		}

		if ($cut && $last != $this->getPageCount())
		{
			$result .= '<li class="disabled"><a href="#">...</a>';
		}

		$result .= '<li class="' . ($this->isLinkToNextPageAvailable() ? '' : 'disabled') . '"><a href="' . $href . '&amp;' . $param . '=' . ($this->getPage() + 1) . '">&rsaquo;</a>';
		$result .= '<li class="' . ($this->isLinkToLastPageAvailable() ? '' : 'disabled') . '"><a href="' . $href . '&amp;' . $param . '=' . $this->getPageCount() . '">&raquo;</a>';
    $result .= '</ul></div>';

		return $result;
	}
}
